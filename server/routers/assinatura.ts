/**
 * Router tRPC para gerenciamento de assinaturas
 * Administradores podem gerenciar todas as assinaturas
 * Usuários comuns podem ver apenas suas próprias assinaturas
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { 
  listarAssinaturas, 
  buscarAssinaturaPorId, 
  buscarAssinaturaAtiva,
  criarAssinatura, 
  atualizarAssinatura, 
  deletarAssinatura,
  cancelarAssinatura,
  buscarPlanoPorId,
  getUserById
} from "../db";

/**
 * Schema de validação para criar/editar assinatura
 */
const assinaturaSchema = z.object({
  userId: z.number(),
  planoId: z.number(),
  status: z.enum(["ativa", "cancelada", "expirada", "trial"]).default("ativa"),
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  renovacaoAutomatica: z.boolean().default(true),
  metodoPagamento: z.string().optional(),
  transacaoId: z.string().optional(),
  observacoes: z.string().optional(),
});

export const assinaturaRouter = router({
  /**
   * Listar assinaturas
   * Admin vê todas, usuário comum vê apenas suas próprias
   */
  listar: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      let userId = input?.userId;
      
      // Se não for admin, só pode ver suas próprias assinaturas
      if (ctx.user.role !== 'admin') {
        userId = ctx.user.id;
      }
      
      const assinaturas = await listarAssinaturas(userId);
      
      // Buscar informações de usuário e plano para cada assinatura
      const assinaturasComDetalhes = await Promise.all(
        assinaturas.map(async (assinatura) => {
          const usuario = await getUserById(assinatura.userId);
          const plano = await buscarPlanoPorId(assinatura.planoId);
          
          return {
            ...assinatura,
            usuario: usuario ? {
              id: usuario.id,
              name: usuario.name,
              email: usuario.email,
            } : null,
            plano: plano ? {
              id: plano.id,
              nome: plano.nome,
              precoMensal: plano.precoMensal,
            } : null,
          };
        })
      );
      
      return assinaturasComDetalhes;
    }),

  /**
   * Buscar assinatura por ID
   */
  buscarPorId: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const assinatura = await buscarAssinaturaPorId(input.id);
      
      if (!assinatura) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assinatura não encontrada",
        });
      }
      
      // Se não for admin, só pode ver sua própria assinatura
      if (ctx.user.role !== 'admin' && assinatura.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para ver esta assinatura",
        });
      }
      
      return assinatura;
    }),

  /**
   * Buscar assinatura ativa do usuário
   */
  minhaAssinatura: protectedProcedure
    .query(async ({ ctx }) => {
      const assinatura = await buscarAssinaturaAtiva(ctx.user.id);
      
      if (!assinatura) {
        return null;
      }
      
      const plano = await buscarPlanoPorId(assinatura.planoId);
      
      return {
        ...assinatura,
        plano,
      };
    }),

  /**
   * Criar nova assinatura (apenas admin)
   */
  criar: protectedProcedure
    .input(assinaturaSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar assinaturas",
        });
      }

      // Verificar se usuário existe
      const usuario = await getUserById(input.userId);
      if (!usuario) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Verificar se plano existe
      const plano = await buscarPlanoPorId(input.planoId);
      if (!plano) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plano não encontrado",
        });
      }

      // Verificar se usuário já tem assinatura ativa
      const assinaturaExistente = await buscarAssinaturaAtiva(input.userId);
      if (assinaturaExistente) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário já possui uma assinatura ativa",
        });
      }

      const assinatura = await criarAssinatura(input);
      return assinatura;
    }),

  /**
   * Atualizar assinatura existente (apenas admin)
   */
  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      dados: assinaturaSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem atualizar assinaturas",
        });
      }

      const assinaturaExistente = await buscarAssinaturaPorId(input.id);
      if (!assinaturaExistente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assinatura não encontrada",
        });
      }

      const assinatura = await atualizarAssinatura(input.id, input.dados);
      return assinatura;
    }),

  /**
   * Deletar assinatura (apenas admin)
   */
  deletar: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem deletar assinaturas",
        });
      }

      const assinaturaExistente = await buscarAssinaturaPorId(input.id);
      if (!assinaturaExistente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assinatura não encontrada",
        });
      }

      await deletarAssinatura(input.id);
      return { success: true };
    }),

  /**
   * Cancelar assinatura
   * Admin pode cancelar qualquer assinatura
   * Usuário comum pode cancelar apenas sua própria assinatura
   */
  cancelar: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const assinaturaExistente = await buscarAssinaturaPorId(input.id);
      
      if (!assinaturaExistente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assinatura não encontrada",
        });
      }

      // Se não for admin, só pode cancelar sua própria assinatura
      if (ctx.user.role !== 'admin' && assinaturaExistente.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para cancelar esta assinatura",
        });
      }

      const assinatura = await cancelarAssinatura(input.id);
      return assinatura;
    }),
});
