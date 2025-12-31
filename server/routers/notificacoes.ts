import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notificacoesConfig, whatsappGrupos, notificacoesHistorico } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const notificacoesRouter = router({
  /**
   * Obter configurações de notificação do usuário
   */
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const config = await db
      .select()
      .from(notificacoesConfig)
      .where(eq(notificacoesConfig.userId, ctx.user.id))
      .limit(1);

    if (config.length === 0) {
      // Criar configuração padrão se não existir
      const [newConfig] = await db.insert(notificacoesConfig).values({
        userId: ctx.user.id,
        notificacoesAtivadas: false,
        notificarNovasVagas: true,
        notificarStatusCandidatura: true,
        notificarFollowUp: false,
      });
      
      return {
        id: newConfig.insertId,
        userId: ctx.user.id,
        whatsappNumero: null,
        notificacoesAtivadas: false,
        notificarNovasVagas: true,
        notificarStatusCandidatura: true,
        notificarFollowUp: false,
      };
    }

    return config[0];
  }),

  /**
   * Atualizar configurações de notificação
   */
  updateConfig: protectedProcedure
    .input(
      z.object({
        whatsappNumero: z.string().optional(),
        notificacoesAtivadas: z.boolean().optional(),
        notificarNovasVagas: z.boolean().optional(),
        notificarStatusCandidatura: z.boolean().optional(),
        notificarFollowUp: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Verificar se já existe configuração
      const existing = await db
        .select()
        .from(notificacoesConfig)
        .where(eq(notificacoesConfig.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        // Criar nova configuração
        await db.insert(notificacoesConfig).values({
          userId: ctx.user.id,
          ...input,
        });
      } else {
        // Atualizar configuração existente
        await db
          .update(notificacoesConfig)
          .set(input)
          .where(eq(notificacoesConfig.userId, ctx.user.id));
      }

      return { success: true };
    }),

  /**
   * Listar grupos WhatsApp do usuário
   */
  listGrupos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .select()
      .from(whatsappGrupos)
      .where(eq(whatsappGrupos.userId, ctx.user.id))
      .orderBy(desc(whatsappGrupos.createdAt));
  }),

  /**
   * Adicionar grupo WhatsApp
   */
  addGrupo: protectedProcedure
    .input(
      z.object({
        nomeGrupo: z.string().min(1, "Nome do grupo é obrigatório"),
        linkGrupo: z.string().url("Link inválido"),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(whatsappGrupos).values({
        userId: ctx.user.id,
        nomeGrupo: input.nomeGrupo,
        linkGrupo: input.linkGrupo,
        descricao: input.descricao,
        ativo: true,
      });

      return { success: true };
    }),

  /**
   * Atualizar grupo WhatsApp
   */
  updateGrupo: protectedProcedure
    .input(
      z.object({
        grupoId: z.number(),
        nomeGrupo: z.string().optional(),
        linkGrupo: z.string().url().optional(),
        descricao: z.string().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { grupoId, ...updateData } = input;

      await db
        .update(whatsappGrupos)
        .set(updateData)
        .where(
          and(
            eq(whatsappGrupos.id, grupoId),
            eq(whatsappGrupos.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Remover grupo WhatsApp
   */
  removeGrupo: protectedProcedure
    .input(z.object({ grupoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(whatsappGrupos)
        .where(
          and(
            eq(whatsappGrupos.id, input.grupoId),
            eq(whatsappGrupos.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Listar histórico de notificações
   */
  historico: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(notificacoesHistorico)
        .where(eq(notificacoesHistorico.userId, ctx.user.id))
        .orderBy(desc(notificacoesHistorico.createdAt))
        .limit(input?.limit || 50);
    }),

  /**
   * Enviar notificação de teste
   */
  enviarTeste: protectedProcedure
    .input(
      z.object({
        destinatario: z.string(),
        mensagem: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Registrar no histórico
      await db.insert(notificacoesHistorico).values({
        userId: ctx.user.id,
        tipo: "sistema",
        destinatario: input.destinatario,
        titulo: "Teste de Notificação",
        mensagem: input.mensagem,
        statusEnvio: "enviado",
        dataEnvio: new Date(),
      });

      // TODO: Integrar com Twilio ou WhatsApp Business API
      // Por enquanto, apenas registra no histórico

      return {
        success: true,
        message: "Notificação de teste registrada! Integração com WhatsApp será implementada em breve.",
      };
    }),

  /**
   * Enviar notificação para grupos
   */
  enviarParaGrupos: protectedProcedure
    .input(
      z.object({
        titulo: z.string(),
        mensagem: z.string(),
        gruposIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Buscar grupos ativos
      let grupos;
      if (input.gruposIds && input.gruposIds.length > 0) {
        grupos = await db
          .select()
          .from(whatsappGrupos)
          .where(
            and(
              eq(whatsappGrupos.userId, ctx.user.id),
              eq(whatsappGrupos.ativo, true)
            )
          );
        grupos = grupos.filter((g: any) => input.gruposIds!.includes(g.id));
      } else {
        grupos = await db
          .select()
          .from(whatsappGrupos)
          .where(
            and(
              eq(whatsappGrupos.userId, ctx.user.id),
              eq(whatsappGrupos.ativo, true)
            )
          );
      }

      // Registrar notificações no histórico
      for (const grupo of grupos) {
        await db.insert(notificacoesHistorico).values({
          userId: ctx.user.id,
          tipo: "nova_vaga",
          destinatario: grupo.nomeGrupo,
          titulo: input.titulo,
          mensagem: input.mensagem,
          statusEnvio: "enviado",
          dataEnvio: new Date(),
          dadosAdicionais: JSON.stringify({ linkGrupo: grupo.linkGrupo }),
        });
      }

      return {
        success: true,
        gruposNotificados: grupos.length,
        message: `Notificação enviada para ${grupos.length} grupo(s)`,
      };
    }),
});
