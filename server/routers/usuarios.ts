import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { User } from "../../drizzle/schema";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUsersStats,
} from "../db";

/**
 * Router para gerenciamento de usuários (CRUD completo)
 * Apenas administradores podem acessar estas rotas
 */
export const usuariosRouter = router({
  /**
   * Listar todos os usuários
   * Suporta busca por nome ou email
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem listar usuários",
        });
      }

      const { search, limit, offset } = input;

      // Buscar usuários com filtros
      const usersList = await getAllUsers({ search, limit, offset });

      // Contar total de usuários (sem paginação)
      const allUsers = await getAllUsers();
      const total = allUsers.length;

      return {
        users: usersList,
        total,
        hasMore: offset + limit < total,
      };
    }),

  /**
   * Buscar usuário por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verificar se é admin ou está buscando o próprio perfil
      if (ctx.user.role !== "admin" && ctx.user.id !== input.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para visualizar este usuário",
        });
      }

      const user = await getUserById(input.id);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      return user;
    }),

  /**
   * Criar novo usuário
   * Apenas administradores podem criar usuários
   */
  create: protectedProcedure
    .input(
      z.object({
        openId: z.string().min(1, "OpenID é obrigatório"),
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        role: z.enum(["user", "admin"]).default("user"),
        loginMethod: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar usuários",
        });
      }

      // Verificar se já existe usuário com este email
      if (input.email) {
        const existingEmail = await getUserByEmail(input.email);

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um usuário com este email",
          });
        }
      }

      // Criar usuário
      const userId = await createUser({
        openId: input.openId,
        name: input.name,
        email: input.email,
        role: input.role,
        loginMethod: input.loginMethod || "manual",
      });

      return {
        success: true,
        userId,
        message: "Usuário criado com sucesso",
      };
    }),

  /**
   * Atualizar usuário existente
   * Administradores podem atualizar qualquer usuário
   * Usuários comuns só podem atualizar o próprio perfil
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, "Nome é obrigatório").optional(),
        email: z.string().email("Email inválido").optional(),
        role: z.enum(["user", "admin"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verificar permissões
      const isAdmin = ctx.user.role === "admin";
      const isOwnProfile = ctx.user.id === id;

      if (!isAdmin && !isOwnProfile) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para atualizar este usuário",
        });
      }

      // Usuários comuns não podem alterar o próprio role
      if (!isAdmin && updateData.role) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não pode alterar seu próprio nível de permissão",
        });
      }

      // Verificar se usuário existe
      const existingUser = await getUserById(id);

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Verificar se email já está em uso por outro usuário
      if (updateData.email) {
        const emailInUse = await getUserByEmail(updateData.email);

        if (emailInUse && emailInUse.id !== id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este email já está em uso por outro usuário",
          });
        }
      }

      // Atualizar usuário
      await updateUser(id, updateData);

      return {
        success: true,
        message: "Usuário atualizado com sucesso",
      };
    }),

  /**
   * Excluir usuário
   * Apenas administradores podem excluir usuários
   * Não é possível excluir o próprio usuário
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem excluir usuários",
        });
      }

      // Não permitir excluir o próprio usuário
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode excluir sua própria conta",
        });
      }

      // Verificar se usuário existe
      const existingUser = await getUserById(input.id);

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Excluir usuário
      await deleteUser(input.id);

      return {
        success: true,
        message: "Usuário excluído com sucesso",
      };
    }),

  /**
   * Obter estatísticas de usuários
   * Apenas para administradores
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas administradores podem visualizar estatísticas",
      });
    }

    const allUsers = await getUsersStats();

    const totalUsers = allUsers.length;
    const adminUsers = allUsers.filter((u: User) => u.role === "admin").length;
    const regularUsers = allUsers.filter((u: User) => u.role === "user").length;

    // Usuários criados nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = allUsers.filter(
      (u: User) => new Date(u.createdAt) > thirtyDaysAgo
    ).length;

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      recentUsers,
    };
  }),
});
