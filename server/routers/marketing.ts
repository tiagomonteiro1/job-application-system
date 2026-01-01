/**
 * Router tRPC para Marketing e Captação de Assinantes
 * Gerencia estratégias, redes sociais e tracking de conversões
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const marketingRouter = router({
  /**
   * Obter estratégias de marketing ativas
   */
  getEstrategias: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const result: any = await db.execute(sql`
      SELECT * FROM marketing_estrategias
      WHERE usuario_id = ${ctx.user.id}
      ORDER BY createdAt DESC
    `);

    return result || [];
  }),

  /**
   * Criar nova estratégia de marketing
   */
  criarEstrategia: protectedProcedure
    .input(z.object({
      nome: z.string().min(3),
      descricao: z.string(),
      tipo: z.enum(['social_media', 'email', 'referral', 'ads', 'content', 'outros']),
      status: z.enum(['ativa', 'pausada', 'concluida']).default('ativa'),
      objetivo: z.string(),
      metrica_alvo: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.execute(sql`
        INSERT INTO marketing_estrategias 
        (usuario_id, nome, descricao, tipo, status, objetivo, metrica_alvo)
        VALUES (${ctx.user.id}, ${input.nome}, ${input.descricao}, ${input.tipo}, 
                ${input.status}, ${input.objetivo}, ${input.metrica_alvo || null})
      `);

      return { success: true, message: 'Estratégia criada com sucesso!' };
    }),

  /**
   * Atualizar estratégia existente
   */
  atualizarEstrategia: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(3).optional(),
      descricao: z.string().optional(),
      status: z.enum(['ativa', 'pausada', 'concluida']).optional(),
      metrica_atual: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const updates: string[] = [];
      if (input.nome) updates.push(`nome = '${input.nome}'`);
      if (input.descricao) updates.push(`descricao = '${input.descricao}'`);
      if (input.status) updates.push(`status = '${input.status}'`);
      if (input.metrica_atual !== undefined) updates.push(`metrica_atual = ${input.metrica_atual}`);
      updates.push(`updatedAt = NOW()`);

      await db.execute(sql.raw(`
        UPDATE marketing_estrategias
        SET ${updates.join(', ')}
        WHERE id = ${input.id} AND usuario_id = ${ctx.user.id}
      `));

      return { success: true, message: 'Estratégia atualizada!' };
    }),

  /**
   * Deletar estratégia
   */
  deletarEstrategia: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.execute(sql`
        DELETE FROM marketing_estrategias
        WHERE id = ${input.id} AND usuario_id = ${ctx.user.id}
      `);

      return { success: true, message: 'Estratégia removida!' };
    }),

  /**
   * Obter redes sociais cadastradas
   */
  getRedesSociais: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const result: any = await db.execute(sql`
      SELECT * FROM marketing_redes_sociais
      WHERE usuario_id = ${ctx.user.id}
      LIMIT 1
    `);

    return result && result.length > 0 ? result[0] : null;
  }),

  /**
   * Salvar/Atualizar redes sociais
   */
  salvarRedesSociais: protectedProcedure
    .input(z.object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      tiktok: z.string().optional(),
      youtube: z.string().optional(),
      whatsapp: z.string().optional(),
      site: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verificar se já existe
      const existing: any = await db.execute(sql`
        SELECT id FROM marketing_redes_sociais
        WHERE usuario_id = ${ctx.user.id}
        LIMIT 1
      `);

      if (existing && existing.length > 0) {
        // Atualizar
        await db.execute(sql`
          UPDATE marketing_redes_sociais
          SET instagram = ${input.instagram || null},
              facebook = ${input.facebook || null},
              linkedin = ${input.linkedin || null},
              twitter = ${input.twitter || null},
              tiktok = ${input.tiktok || null},
              youtube = ${input.youtube || null},
              whatsapp = ${input.whatsapp || null},
              site = ${input.site || null},
              updatedAt = NOW()
          WHERE usuario_id = ${ctx.user.id}
        `);
      } else {
        // Inserir
        await db.execute(sql`
          INSERT INTO marketing_redes_sociais
          (usuario_id, instagram, facebook, linkedin, twitter, tiktok, youtube, whatsapp, site)
          VALUES (${ctx.user.id}, ${input.instagram || null}, ${input.facebook || null},
                  ${input.linkedin || null}, ${input.twitter || null}, ${input.tiktok || null},
                  ${input.youtube || null}, ${input.whatsapp || null}, ${input.site || null})
        `);
      }

      return { success: true, message: 'Redes sociais atualizadas!' };
    }),

  /**
   * Obter estatísticas de conversão
   */
  getEstatisticasConversao: protectedProcedure
    .input(z.object({
      periodo: z.enum(['7dias', '30dias', '90dias', 'total']).default('30dias'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let dataFiltro = '';
      switch (input?.periodo || '30dias') {
        case '7dias':
          dataFiltro = 'AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30dias':
          dataFiltro = 'AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case '90dias':
          dataFiltro = 'AND createdAt >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
          break;
        case 'total':
        default:
          dataFiltro = '';
      }

      // Estatísticas de assinantes (simulado - adaptar conforme sua tabela real)
      const result: any = await db.execute(sql.raw(`
        SELECT 
          COUNT(*) as total_assinantes,
          SUM(CASE WHEN origem_cadastro = 'instagram' THEN 1 ELSE 0 END) as instagram,
          SUM(CASE WHEN origem_cadastro = 'facebook' THEN 1 ELSE 0 END) as facebook,
          SUM(CASE WHEN origem_cadastro = 'linkedin' THEN 1 ELSE 0 END) as linkedin,
          SUM(CASE WHEN origem_cadastro = 'twitter' THEN 1 ELSE 0 END) as twitter,
          SUM(CASE WHEN origem_cadastro = 'tiktok' THEN 1 ELSE 0 END) as tiktok,
          SUM(CASE WHEN origem_cadastro = 'youtube' THEN 1 ELSE 0 END) as youtube,
          SUM(CASE WHEN origem_cadastro = 'referral' THEN 1 ELSE 0 END) as referral,
          SUM(CASE WHEN origem_cadastro = 'organico' THEN 1 ELSE 0 END) as organico,
          SUM(CASE WHEN origem_cadastro = 'outros' THEN 1 ELSE 0 END) as outros
        FROM assinaturas
        WHERE 1=1 ${dataFiltro}
      `));

      const stats = result && result.length > 0 ? result[0] : {
        total_assinantes: 0,
        instagram: 0,
        facebook: 0,
        linkedin: 0,
        twitter: 0,
        tiktok: 0,
        youtube: 0,
        referral: 0,
        organico: 0,
        outros: 0,
      };

      return {
        total_assinantes: Number(stats.total_assinantes) || 0,
        por_origem: {
          instagram: Number(stats.instagram) || 0,
          facebook: Number(stats.facebook) || 0,
          linkedin: Number(stats.linkedin) || 0,
          twitter: Number(stats.twitter) || 0,
          tiktok: Number(stats.tiktok) || 0,
          youtube: Number(stats.youtube) || 0,
          referral: Number(stats.referral) || 0,
          organico: Number(stats.organico) || 0,
          outros: Number(stats.outros) || 0,
        },
      };
    }),

  /**
   * Gerar link de compartilhamento com tracking
   */
  gerarLinkCompartilhamento: protectedProcedure
    .input(z.object({
      origem: z.enum(['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube', 'whatsapp', 'email', 'outros']),
      campanha: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Gerar código único
      const codigo = `${input.origem}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.execute(sql`
        INSERT INTO marketing_links
        (usuario_id, codigo, origem, campanha)
        VALUES (${ctx.user.id}, ${codigo}, ${input.origem}, ${input.campanha || null})
      `);

      const baseUrl = process.env.VITE_APP_URL || 'https://jobmatch.ai';
      const link = `${baseUrl}/cadastro?ref=${codigo}`;

      return { 
        success: true, 
        link,
        codigo,
        message: 'Link gerado com sucesso!' 
      };
    }),

  /**
   * Obter performance de links de compartilhamento
   */
  getPerformanceLinks: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const result: any = await db.execute(sql`
      SELECT 
        ml.id,
        ml.codigo,
        ml.origem,
        ml.campanha,
        ml.cliques,
        ml.conversoes,
        ml.createdAt,
        ROUND((ml.conversoes * 100.0) / NULLIF(ml.cliques, 0), 2) as taxa_conversao
      FROM marketing_links ml
      WHERE ml.usuario_id = ${ctx.user.id}
      ORDER BY ml.createdAt DESC
      LIMIT 50
    `);

    return result || [];
  }),
});
