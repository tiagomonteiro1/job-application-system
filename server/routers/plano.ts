/**
 * Router tRPC para gerenciamento de planos de assinatura
 * Apenas administradores podem gerenciar planos
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { 
  listarPlanos, 
  buscarPlanoPorId, 
  criarPlano, 
  atualizarPlano, 
  deletarPlano,
  ativarDesativarPlano
} from "../db";

/**
 * Schema de validação para criar/editar plano
 */
const planoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  precoMensal: z.number().min(0, "Preço mensal deve ser maior ou igual a 0"),
  precoAnual: z.number().min(0, "Preço anual deve ser maior ou igual a 0").optional(),
  modulosPermitidos: z.array(z.string()).min(1, "Selecione pelo menos um módulo"),
  limiteCurriculos: z.number().min(1, "Limite de currículos deve ser maior que 0").default(10),
  limiteCandidaturas: z.number().min(1, "Limite de candidaturas deve ser maior que 0").default(50),
  ativo: z.boolean().default(true),
  ordem: z.number().default(0),
});

export const planoRouter = router({
  /**
   * Listar todos os planos
   * Usuários comuns veem apenas planos ativos
   * Administradores veem todos os planos
   */
  listar: protectedProcedure
    .input(z.object({
      apenasAtivos: z.boolean().default(true),
    }).optional())
    .query(async ({ ctx, input }) => {
      const apenasAtivos = ctx.user.role === 'admin' ? input?.apenasAtivos ?? false : true;
      const planos = await listarPlanos(apenasAtivos);
      return planos;
    }),

  /**
   * Buscar plano por ID
   */
  buscarPorId: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const plano = await buscarPlanoPorId(input.id);
      if (!plano) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plano não encontrado",
        });
      }
      return plano;
    }),

  /**
   * Criar novo plano (apenas admin)
   */
  criar: protectedProcedure
    .input(planoSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar planos",
        });
      }

      const plano = await criarPlano({
        ...input,
        modulosPermitidos: JSON.stringify(input.modulosPermitidos),
      });

      return plano;
    }),

  /**
   * Atualizar plano existente (apenas admin)
   */
  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      dados: planoSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem atualizar planos",
        });
      }

      const planoExistente = await buscarPlanoPorId(input.id);
      if (!planoExistente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plano não encontrado",
        });
      }

      const dadosAtualizados = {
        ...input.dados,
        modulosPermitidos: input.dados.modulosPermitidos 
          ? JSON.stringify(input.dados.modulosPermitidos)
          : undefined,
      };

      const plano = await atualizarPlano(input.id, dadosAtualizados);
      return plano;
    }),

  /**
   * Deletar plano (apenas admin)
   */
  deletar: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem deletar planos",
        });
      }

      const planoExistente = await buscarPlanoPorId(input.id);
      if (!planoExistente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plano não encontrado",
        });
      }

      await deletarPlano(input.id);
      return { success: true };
    }),

  /**
   * Ativar/desativar plano (apenas admin)
   */
  ativarDesativar: protectedProcedure
    .input(z.object({
      id: z.number(),
      ativo: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem ativar/desativar planos",
        });
      }

      const planoExistente = await buscarPlanoPorId(input.id);
      if (!planoExistente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plano não encontrado",
        });
      }

      const plano = await ativarDesativarPlano(input.id, input.ativo);
      return plano;
    }),
});
