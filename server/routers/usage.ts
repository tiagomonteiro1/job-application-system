/**
 * Router tRPC para gerenciamento de uso de recursos
 * Fornece informações sobre consumo mensal do usuário
 */

import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

interface UsoMensal {
  curriculos_enviados: number;
  limite_curriculos: number;
  candidaturas_enviadas: number;
  limite_candidaturas: number;
  analises_realizadas: number;
  limite_analises: number;
  plano_nome: string;
  plano_preco: number;
  pode_upgrade: boolean;
}

/**
 * Busca uso mensal do usuário logado
 */
async function buscarUsoMensal(userId: number): Promise<UsoMensal> {
  // Buscar plano ativo do usuário
  const planoQuery = sql`
    SELECT 
      p.nome as plano_nome,
      p.preco as plano_preco,
      p.limite_curriculos,
      p.limite_candidaturas,
      p.limite_analises
    FROM assinaturas a
    INNER JOIN planos p ON a.plano_id = p.id
    WHERE a.usuario_id = ${userId}
      AND a.status = 'ativa'
      AND (a.data_fim IS NULL OR a.data_fim >= NOW())
    ORDER BY a.data_inicio DESC
    LIMIT 1
  `;

  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const planoResult: any = await db.execute(planoQuery);
  const plano = Array.isArray(planoResult) && planoResult.length > 0 
    ? planoResult[0] as any
    : null;

  // Se não tem plano, retorna valores zerados
  if (!plano) {
    return {
      curriculos_enviados: 0,
      limite_curriculos: 0,
      candidaturas_enviadas: 0,
      limite_candidaturas: 0,
      analises_realizadas: 0,
      limite_analises: 0,
      plano_nome: 'Sem Plano',
      plano_preco: 0,
      pode_upgrade: true,
    };
  }

  // Buscar uso do mês atual
  const dbUso = await getDb();
  if (!dbUso) throw new Error('Database not available');
  
  const usoQuery = sql`
    SELECT 
      COALESCE(curriculos_enviados, 0) as curriculos_enviados,
      COALESCE(candidaturas_enviadas, 0) as candidaturas_enviadas,
      COALESCE(analises_realizadas, 0) as analises_realizadas
    FROM uso_recursos
    WHERE usuario_id = ${userId}
      AND mes = MONTH(NOW())
      AND ano = YEAR(NOW())
    LIMIT 1
  `;

  const usoResult: any = await dbUso.execute(usoQuery);
  const uso = Array.isArray(usoResult) && usoResult.length > 0
    ? usoResult[0] as any
    : {
        curriculos_enviados: 0,
        candidaturas_enviadas: 0,
        analises_realizadas: 0,
      };

  // Verificar se pode fazer upgrade (se não está no plano mais caro)
  const planosMaisCarosQuery = sql`
    SELECT COUNT(*) as count
    FROM planos
    WHERE preco > ${plano.plano_preco}
  `;

  const dbPlanos = await getDb();
  if (!dbPlanos) throw new Error('Database not available');
  
  const planosMaisCarosResult: any = await dbPlanos.execute(planosMaisCarosQuery);
  const podeUpgrade = Array.isArray(planosMaisCarosResult) && planosMaisCarosResult.length > 0
    ? (planosMaisCarosResult[0] as any).count > 0
    : false;

  return {
    curriculos_enviados: Number(uso.curriculos_enviados) || 0,
    limite_curriculos: Number(plano.limite_curriculos) || 0,
    candidaturas_enviadas: Number(uso.candidaturas_enviadas) || 0,
    limite_candidaturas: Number(plano.limite_candidaturas) || 0,
    analises_realizadas: Number(uso.analises_realizadas) || 0,
    limite_analises: Number(plano.limite_analises) || 0,
    plano_nome: plano.plano_nome || 'Sem Plano',
    plano_preco: Number(plano.plano_preco) || 0,
    pode_upgrade: podeUpgrade,
  };
}

export const usageRouter = router({
  /**
   * Busca uso mensal do usuário logado
   */
  getUsoMensal: protectedProcedure
    .query(async ({ ctx }) => {
      return await buscarUsoMensal(ctx.user.id);
    }),

  /**
   * Busca estatísticas gerais de uso (para admin)
   */
  getEstatisticas: protectedProcedure
    .query(async ({ ctx }) => {
      // Apenas admin pode ver estatísticas gerais
      if (ctx.user.role !== 'admin') {
        return null;
      }

      const query = sql`
        SELECT 
          COUNT(DISTINCT usuario_id) as total_usuarios_ativos,
          SUM(curriculos_enviados) as total_curriculos,
          SUM(candidaturas_enviadas) as total_candidaturas,
          SUM(analises_realizadas) as total_analises
        FROM uso_recursos
        WHERE mes = MONTH(NOW())
          AND ano = YEAR(NOW())
      `;

      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result: any = await db.execute(query);
      const stats = Array.isArray(result) && result.length > 0
        ? result[0] as any
        : null;

      return stats ? {
        total_usuarios_ativos: Number(stats.total_usuarios_ativos) || 0,
        total_curriculos: Number(stats.total_curriculos) || 0,
        total_candidaturas: Number(stats.total_candidaturas) || 0,
        total_analises: Number(stats.total_analises) || 0,
      } : null;
    }),
});
