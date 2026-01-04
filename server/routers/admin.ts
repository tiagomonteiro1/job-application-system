import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq, like, or, desc, asc } from "drizzle-orm";

/**
 * Router para funcionalidades administrativas
 * Requer autenticação e role de admin
 */
export const adminRouter = router({
  /**
   * Listar usuários com filtros e paginação
   */
  usuarios: router({
    list: protectedProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
          role: z.enum(["user", "admin", "all"]).default("all"),
          sortBy: z.enum(["name", "email", "createdAt", "lastSignedIn"]).default("createdAt"),
          sortOrder: z.enum(["asc", "desc"]).default("desc"),
        })
      )
      .query(async ({ input, ctx }) => {
        // Verificar se usuário é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem acessar esta funcionalidade.");
        }

        const { page, pageSize, search, role, sortBy, sortOrder } = input;
        const offset = (page - 1) * pageSize;

        // Obter instância do banco
        const db = await getDb();
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        // Construir query com filtros
        let query = db.select().from(users);

        // Filtro de busca (nome ou email)
        if (search && search.trim() !== "") {
          query = query.where(
            or(
              like(users.name, `%${search}%`),
              like(users.email, `%${search}%`)
            )
          ) as any;
        }

        // Filtro de role
        if (role !== "all") {
          query = query.where(eq(users.role, role)) as any;
        }

        // Ordenação
        const orderColumn = users[sortBy];
        query = query.orderBy(sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn)) as any;

        // Paginação
        query = query.limit(pageSize).offset(offset) as any;

        const usersList = await query;

        // Contar total de usuários (para paginação)
        let countQuery = db.select().from(users);
        if (search && search.trim() !== "") {
          countQuery = countQuery.where(
            or(
              like(users.name, `%${search}%`),
              like(users.email, `%${search}%`)
            )
          ) as any;
        }
        if (role !== "all") {
          countQuery = countQuery.where(eq(users.role, role)) as any;
        }
        const allUsers = await countQuery;
        const total = allUsers.length;

        return {
          users: usersList,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        };
      }),

    /**
     * Criar novo usuário
     */
    create: protectedProcedure
      .input(
        z.object({
          openId: z.string().min(1),
          name: z.string().min(1),
          email: z.string().email(),
          role: z.enum(["user", "admin"]).default("user"),
          loginMethod: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar se usuário é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem criar usuários.");
        }

        const db = await getDb();
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        // Verificar se openId já existe
        const existingUser = await db.select().from(users).where(eq(users.openId, input.openId));
        if (existingUser.length > 0) {
          throw new Error("Já existe um usuário com este OpenID.");
        }

        // Verificar se email já existe
        if (input.email) {
          const existingEmail = await db.select().from(users).where(eq(users.email, input.email));
          if (existingEmail.length > 0) {
            throw new Error("Já existe um usuário com este email.");
          }
        }

        // Criar usuário
        const [newUser] = await db.insert(users).values({
          openId: input.openId,
          name: input.name,
          email: input.email,
          role: input.role,
          loginMethod: input.loginMethod || "manual",
        });

        return { success: true, userId: newUser.insertId };
      }),

    /**
     * Atualizar usuário existente
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          role: z.enum(["user", "admin"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar se usuário é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem atualizar usuários.");
        }

        const db = await getDb();
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        const { id, ...updateData } = input;

        // Verificar se usuário existe
        const existingUser = await db.select().from(users).where(eq(users.id, id));
        if (existingUser.length === 0) {
          throw new Error("Usuário não encontrado.");
        }

        // Verificar se email já está em uso por outro usuário
        if (updateData.email) {
          const emailInUse = await db
            .select()
            .from(users)
            .where(eq(users.email, updateData.email));
          if (emailInUse.length > 0 && emailInUse[0].id !== id) {
            throw new Error("Este email já está em uso por outro usuário.");
          }
        }

        // Atualizar usuário
        await db.update(users).set(updateData).where(eq(users.id, id));

        return { success: true };
      }),

    /**
     * Deletar usuário (soft delete - apenas desativa)
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verificar se usuário é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem deletar usuários.");
        }

        const db = await getDb();
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        // Verificar se usuário existe
        const existingUser = await db.select().from(users).where(eq(users.id, input.id));
        if (existingUser.length === 0) {
          throw new Error("Usuário não encontrado.");
        }

        // Não permitir deletar o próprio usuário
        if (existingUser[0].id === ctx.user.id) {
          throw new Error("Você não pode deletar sua própria conta.");
        }

        // Por enquanto, vamos realmente deletar
        // Em produção, considere adicionar um campo "active" para soft delete
        await db.delete(users).where(eq(users.id, input.id));

        return { success: true };
      }),

    /**
     * Alterar role do usuário
     */
    changeRole: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          role: z.enum(["user", "admin"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar se usuário é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem alterar roles.");
        }

        const db = await getDb();
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        // Verificar se usuário existe
        const existingUser = await db.select().from(users).where(eq(users.id, input.id));
        if (existingUser.length === 0) {
          throw new Error("Usuário não encontrado.");
        }

        // Não permitir alterar a própria role
        if (existingUser[0].id === ctx.user.id) {
          throw new Error("Você não pode alterar sua própria role.");
        }

        // Atualizar role
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));

        return { success: true };
      }),

    /**
     * Obter detalhes de um usuário específico
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verificar se usuário é admin
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado. Apenas administradores podem visualizar detalhes de usuários.");
        }

        const db = await getDb();
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        const user = await db.select().from(users).where(eq(users.id, input.id));
        if (user.length === 0) {
          throw new Error("Usuário não encontrado.");
        }

        return user[0];
      }),
  }),
});
