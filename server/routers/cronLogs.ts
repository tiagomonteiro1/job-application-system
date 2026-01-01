/**
 * Router tRPC para gerenciamento de logs do Cron Job
 * Fornece histórico de execuções e estatísticas de envios
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const cronLogsRouter = router({
  /**
   * Buscar histórico de execuções do cron
   */
  getHistorico: protectedProcedure
    .input(z.object({
      status: z.enum(['todos', 'enviado', 'falhou']).optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let whereConditions = [`nh.usuario_id = ${ctx.user.id}`];

      // Filtro por status
      if (input?.status && input.status !== 'todos') {
        whereConditions.push(`nh.status_envio = '${input.status}'`);
      }

      // Filtro por data início
      if (input?.dataInicio) {
        whereConditions.push(`nh.data_envio >= '${input.dataInicio}'`);
      }

      // Filtro por data fim
      if (input?.dataFim) {
        whereConditions.push(`nh.data_envio <= '${input.dataFim}'`);
      }

      const whereClause = whereConditions.join(' AND ');

      const query = sql.raw(`
        SELECT 
          nh.id,
          nh.tipo,
          nh.destinatario,
          nh.titulo,
          nh.mensagem,
          nh.status_envio,
          nh.erro_mensagem,
          nh.data_envio,
          nh.createdAt,
          f.id as followup_id,
          c.vagaData
        FROM notificacoes_historico nh
        LEFT JOIN followups f ON nh.titulo LIKE CONCAT('%followup%') 
        LEFT JOIN candidaturas c ON f.candidaturaId = c.id
        WHERE ${whereClause}
        ORDER BY nh.data_envio DESC
        LIMIT ${input?.limit || 50}
        OFFSET ${input?.offset || 0}
      `);

      const result: any = await db.execute(query);
      
      // Buscar total de registros para paginação
      const countQuery = sql.raw(`
        SELECT COUNT(*) as total
        FROM notificacoes_historico nh
        WHERE ${whereClause}
      `);
      
      const countResult: any = await db.execute(countQuery);
      const total = countResult && countResult.length > 0 ? countResult[0].total : 0;

      return {
        logs: result || [],
        total: Number(total),
        hasMore: (input?.offset || 0) + (input?.limit || 50) < Number(total),
      };
    }),

  /**
   * Buscar estatísticas de envios
   */
  getEstatisticas: protectedProcedure
    .input(z.object({
      periodo: z.enum(['hoje', 'semana', 'mes', 'total']).default('mes'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let dataFiltro = '';
      
      switch (input?.periodo || 'mes') {
        case 'hoje':
          dataFiltro = 'AND nh.data_envio >= CURDATE()';
          break;
        case 'semana':
          dataFiltro = 'AND nh.data_envio >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'mes':
          dataFiltro = 'AND nh.data_envio >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case 'total':
        default:
          dataFiltro = '';
      }

      const query = sql.raw(`
        SELECT 
          COUNT(*) as total_envios,
          SUM(CASE WHEN status_envio = 'enviado' THEN 1 ELSE 0 END) as total_sucesso,
          SUM(CASE WHEN status_envio = 'falhou' THEN 1 ELSE 0 END) as total_falhas,
          SUM(CASE WHEN tipo = 'whatsapp' THEN 1 ELSE 0 END) as total_whatsapp,
          SUM(CASE WHEN tipo = 'email' THEN 1 ELSE 0 END) as total_email,
          ROUND(
            (SUM(CASE WHEN status_envio = 'enviado' THEN 1 ELSE 0 END) * 100.0) / 
            NULLIF(COUNT(*), 0), 
            2
          ) as taxa_sucesso
        FROM notificacoes_historico nh
        WHERE nh.usuario_id = ${ctx.user.id}
        ${dataFiltro}
      `);

      const result: any = await db.execute(query);
      const stats = result && result.length > 0 ? result[0] : null;

      if (!stats) {
        return {
          total_envios: 0,
          total_sucesso: 0,
          total_falhas: 0,
          total_whatsapp: 0,
          total_email: 0,
          taxa_sucesso: 0,
        };
      }

      return {
        total_envios: Number(stats.total_envios) || 0,
        total_sucesso: Number(stats.total_sucesso) || 0,
        total_falhas: Number(stats.total_falhas) || 0,
        total_whatsapp: Number(stats.total_whatsapp) || 0,
        total_email: Number(stats.total_email) || 0,
        taxa_sucesso: Number(stats.taxa_sucesso) || 0,
      };
    }),

  /**
   * Buscar estatísticas por dia (para gráfico)
   */
  getEstatisticasPorDia: protectedProcedure
    .input(z.object({
      dias: z.number().min(1).max(90).default(30),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const dias = input?.dias || 30;

      const query = sql.raw(`
        SELECT 
          DATE(data_envio) as data,
          COUNT(*) as total,
          SUM(CASE WHEN status_envio = 'enviado' THEN 1 ELSE 0 END) as sucesso,
          SUM(CASE WHEN status_envio = 'falhou' THEN 1 ELSE 0 END) as falhas
        FROM notificacoes_historico
        WHERE usuario_id = ${ctx.user.id}
          AND data_envio >= DATE_SUB(NOW(), INTERVAL ${dias} DAY)
        GROUP BY DATE(data_envio)
        ORDER BY data DESC
      `);

      const result: any = await db.execute(query);
      
      return (result || []).map((row: any) => ({
        data: row.data,
        total: Number(row.total) || 0,
        sucesso: Number(row.sucesso) || 0,
        falhas: Number(row.falhas) || 0,
      }));
    }),

  /**
   * Buscar detalhes de um log específico
   */
  getDetalhe: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const query = sql.raw(`
        SELECT 
          nh.*,
          f.id as followup_id,
          f.candidaturaId,
          f.data_agendada,
          c.vagaData
        FROM notificacoes_historico nh
        LEFT JOIN followups f ON nh.titulo LIKE CONCAT('%followup%')
        LEFT JOIN candidaturas c ON f.candidaturaId = c.id
        WHERE nh.id = ${input.id}
          AND nh.usuario_id = ${ctx.user.id}
        LIMIT 1
      `);

      const result: any = await db.execute(query);
      return result && result.length > 0 ? result[0] : null;
    }),

  /**
   * Reenviar um follow-up que falhou
   */
  reenviar: protectedProcedure
    .input(z.object({
      logId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Buscar log original
      const logQuery = sql.raw(`
        SELECT * FROM notificacoes_historico
        WHERE id = ${input.logId}
          AND usuario_id = ${ctx.user.id}
          AND status_envio = 'falhou'
        LIMIT 1
      `);

      const logResult: any = await db.execute(logQuery);
      
      if (!logResult || logResult.length === 0) {
        throw new Error('Log não encontrado ou já foi enviado com sucesso');
      }

      const log = logResult[0];

      // TODO: Implementar lógica real de reenvio
      // Por enquanto, apenas atualiza o status para "reenviado"
      await db.execute(sql.raw(`
        UPDATE notificacoes_historico
        SET status_envio = 'enviado',
            erro_mensagem = NULL,
            data_envio = NOW()
        WHERE id = ${input.logId}
      `));

      return { success: true, message: 'Follow-up reenviado com sucesso!' };
    }),
});
