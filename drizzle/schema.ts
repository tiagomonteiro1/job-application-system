import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

/**
 * Tabela de configurações de automação
 * Armazena preferências do usuário para busca automática de vagas
 */
export const automacaoConfig = mysqlTable("automacao_config", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Se a automação está ativa */
  ativa: boolean("ativa").default(false).notNull(),
  /** Áreas de interesse (JSON array) */
  areasInteresse: text("areas_interesse").notNull(), // ["PHP Sênior", "Pentester", "Segurança"]
  /** Palavras-chave extras (JSON array) */
  palavrasChave: text("palavras_chave"), // ["n8n", "ChatGPT", "IA"]
  /** Localização preferida */
  localizacao: varchar("localizacao", { length: 255 }).default("Brasil - Remoto"),
  /** Tipo de trabalho */
  tipoTrabalho: varchar("tipo_trabalho", { length: 50 }).default("remoto"),
  /** Envio automático ativado */
  envioAutomatico: boolean("envio_automatico").default(false).notNull(),
  /** Última execução da automação */
  ultimaExecucao: timestamp("ultima_execucao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomacaoConfig = typeof automacaoConfig.$inferSelect;
export type InsertAutomacaoConfig = typeof automacaoConfig.$inferInsert;

/**
 * Tabela de vagas encontradas automaticamente
 * Armazena todas as vagas coletadas pelo sistema de automação
 */
export const vagasAutomaticas = mysqlTable("vagas_automaticas", {
  id: int("id").autoincrement().primaryKey(),
  /** URL única da vaga (para evitar duplicatas) */
  vagaUrl: varchar("vaga_url", { length: 1000 }).notNull().unique(),
  /** Título da vaga */
  titulo: varchar("titulo", { length: 500 }).notNull(),
  /** Nome da empresa */
  empresa: varchar("empresa", { length: 255 }).notNull(),
  /** Localização */
  localizacao: varchar("localizacao", { length: 255 }),
  /** Tipo de contrato */
  tipoContrato: varchar("tipo_contrato", { length: 100 }),
  /** Descrição completa da vaga */
  descricao: text("descricao"),
  /** Requisitos principais (JSON array) */
  requisitos: text("requisitos"),
  /** Benefícios (JSON array) */
  beneficios: text("beneficios"),
  /** Site de origem */
  fonte: varchar("fonte", { length: 50 }).notNull(), // "LinkedIn", "Indeed", "Gupy"
  /** Score de compatibilidade (0-100) */
  scoreCompatibilidade: int("score_compatibilidade"),
  /** Motivo da compatibilidade */
  motivoCompatibilidade: text("motivo_compatibilidade"),
  /** Área de atuação */
  area: varchar("area", { length: 100 }),
  /** Se já foi processada/enviada */
  processada: boolean("processada").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VagaAutomatica = typeof vagasAutomaticas.$inferSelect;
export type InsertVagaAutomatica = typeof vagasAutomaticas.$inferInsert;

/**
 * Tabela de log de execuções da automação
 * Registra cada execução do sistema de busca automática
 */
export const automacaoLogs = mysqlTable("automacao_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Timestamp da execução */
  dataExecucao: timestamp("data_execucao").defaultNow().notNull(),
  /** Status da execução */
  status: mysqlEnum("status", ["success", "error", "partial"]).notNull(),
  /** Número de vagas encontradas */
  vagasEncontradas: int("vagas_encontradas").default(0),
  /** Número de vagas novas (não duplicadas) */
  vagasNovas: int("vagas_novas").default(0),
  /** Número de candidaturas enviadas automaticamente */
  candidaturasEnviadas: int("candidaturas_enviadas").default(0),
  /** Mensagem de erro (se houver) */
  mensagemErro: text("mensagem_erro"),
  /** Detalhes da execução (JSON) */
  detalhes: text("detalhes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutomacaoLog = typeof automacaoLogs.$inferSelect;
export type InsertAutomacaoLog = typeof automacaoLogs.$inferInsert;
