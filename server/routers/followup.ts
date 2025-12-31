import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const followupRouter = router({
  // Configurações
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.execute(sql`
      SELECT * FROM followup_config WHERE userId = ${ctx.user.id} LIMIT 1
    `);
    return result.rows[0] || null;
  }),

  saveConfig: protectedProcedure
    .input(z.object({
      ativo: z.boolean(),
      dias_apos_candidatura: z.number().min(1).max(30),
      enviar_whatsapp: z.boolean(),
      enviar_email: z.boolean(),
      horario_envio: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se já existe configuração
      const existing = await db.execute(sql`
        SELECT id FROM followup_config WHERE userId = ${ctx.user.id} LIMIT 1
      `);

      if (existing.rows.length > 0) {
        // Atualizar
        await db.execute(sql`
          UPDATE followup_config 
          SET ativo = ${input.ativo ? 1 : 0},
              dias_apos_candidatura = ${input.dias_apos_candidatura},
              enviar_whatsapp = ${input.enviar_whatsapp ? 1 : 0},
              enviar_email = ${input.enviar_email ? 1 : 0},
              horario_envio = ${input.horario_envio},
              updatedAt = CURRENT_TIMESTAMP
          WHERE userId = ${ctx.user.id}
        `);
      } else {
        // Criar
        await db.execute(sql`
          INSERT INTO followup_config (userId, ativo, dias_apos_candidatura, enviar_whatsapp, enviar_email, horario_envio)
          VALUES (${ctx.user.id}, ${input.ativo ? 1 : 0}, ${input.dias_apos_candidatura}, ${input.enviar_whatsapp ? 1 : 0}, ${input.enviar_email ? 1 : 0}, ${input.horario_envio})
        `);
      }

      return { success: true };
    }),

  // Follow-ups
  listar: protectedProcedure
    .input(z.object({
      status: z.enum(['todos', 'pendente', 'enviado', 'respondido']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      let query = sql`
        SELECT f.*, c.vagaData
        FROM followups f
        LEFT JOIN candidaturas c ON f.candidaturaId = c.id
        WHERE f.userId = ${ctx.user.id}
      `;

      if (input?.status && input.status !== 'todos') {
        query = sql`${query} AND f.status = ${input.status}`;
      }

      query = sql`${query} ORDER BY f.data_agendada DESC LIMIT 100`;

      const result = await db.execute(query);
      return result.rows || [];
    }),

  marcarEnviado: protectedProcedure
    .input(z.object({
      id: z.number(),
      resposta_empresa: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.execute(sql`
        UPDATE followups
        SET status = ${input.resposta_empresa ? 'respondido' : 'enviado'},
            data_enviado = CURRENT_TIMESTAMP,
            resposta_empresa = ${input.resposta_empresa || null},
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ${input.id} AND userId = ${ctx.user.id}
      `);

      return { success: true };
    }),

  cancelar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.execute(sql`
        DELETE FROM followups
        WHERE id = ${input.id} AND userId = ${ctx.user.id}
      `);

      return { success: true };
    }),

  // Templates
  listarTemplates: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.execute(sql`
      SELECT * FROM followup_templates 
      WHERE userId = ${ctx.user.id} AND ativo = 1
      ORDER BY nome ASC
    `);
    return result.rows || [];
  }),

  criarTemplate: protectedProcedure
    .input(z.object({
      nome: z.string(),
      assunto: z.string().optional(),
      mensagem: z.string(),
      tipo_vaga: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.execute(sql`
        INSERT INTO followup_templates (userId, nome, assunto, mensagem, tipo_vaga)
        VALUES (${ctx.user.id}, ${input.nome}, ${input.assunto || null}, ${input.mensagem}, ${input.tipo_vaga || null})
      `);

      return { success: true };
    }),

  atualizarTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string(),
      assunto: z.string().optional(),
      mensagem: z.string(),
      tipo_vaga: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.execute(sql`
        UPDATE followup_templates
        SET nome = ${input.nome},
            assunto = ${input.assunto || null},
            mensagem = ${input.mensagem},
            tipo_vaga = ${input.tipo_vaga || null},
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ${input.id} AND userId = ${ctx.user.id}
      `);

      return { success: true };
    }),

  deletarTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.execute(sql`
        DELETE FROM followup_templates
        WHERE id = ${input.id} AND userId = ${ctx.user.id}
      `);

      return { success: true };
    }),

  // Agendar follow-up manualmente
  agendar: protectedProcedure
    .input(z.object({
      candidaturaId: z.number(),
      data_agendada: z.string(),
      mensagem: z.string(),
      tipo_envio: z.enum(['whatsapp', 'email']),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.execute(sql`
        INSERT INTO followups (userId, candidaturaId, data_agendada, mensagem, tipo_envio)
        VALUES (${ctx.user.id}, ${input.candidaturaId}, ${input.data_agendada}, ${input.mensagem}, ${input.tipo_envio})
      `);

      return { success: true };
    }),
});
