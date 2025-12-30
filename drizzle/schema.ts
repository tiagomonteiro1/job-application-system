import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de currículos dos usuários
 * Armazena o PDF original e a versão analisada/refatorada
 */
export const curriculos = mysqlTable("curriculos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** URL do PDF original no S3 */
  originalPdfUrl: text("originalPdfUrl").notNull(),
  /** Chave do arquivo no S3 */
  originalPdfKey: text("originalPdfKey").notNull(),
  /** Texto extraído do PDF original */
  originalText: text("originalText"),
  /** Análise da IA sobre o currículo */
  analiseIA: text("analiseIA"),
  /** Currículo refatorado pela IA (markdown) */
  curriculoRefatorado: text("curriculoRefatorado"),
  /** URL do PDF refatorado no S3 */
  refatoradoPdfUrl: text("refatoradoPdfUrl"),
  /** Chave do PDF refatorado no S3 */
  refatoradoPdfKey: text("refatoradoPdfKey"),
  /** Status do processamento */
  status: mysqlEnum("status", ["uploaded", "analyzing", "analyzed", "error"]).default("uploaded").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Curriculo = typeof curriculos.$inferSelect;
export type InsertCurriculo = typeof curriculos.$inferInsert;

/**
 * Tabela de candidaturas
 * Registra cada envio de currículo para uma vaga
 */
export const candidaturas = mysqlTable("candidaturas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  curriculoId: int("curriculoId").notNull(),
  /** Dados da vaga em JSON */
  vagaData: text("vagaData").notNull(),
  /** Carta de apresentação gerada pela IA */
  cartaApresentacao: text("cartaApresentacao"),
  /** Status da candidatura */
  status: mysqlEnum("status", ["pending", "sent", "viewed", "rejected", "accepted"]).default("pending").notNull(),
  /** Data de envio */
  dataEnvio: timestamp("dataEnvio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidatura = typeof candidaturas.$inferSelect;
export type InsertCandidatura = typeof candidaturas.$inferInsert;