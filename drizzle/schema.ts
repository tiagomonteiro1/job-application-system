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
  /** Status de entrega validado pelo usuário */
  statusEntrega: mysqlEnum("status_entrega", ["pendente", "confirmado", "nao_entregue"]).default("pendente").notNull(),
  /** Link para acessar o cadastro no site da empresa */
  linkValidacao: text("link_validacao"),
  /** Observações sobre a entrega (protocolo, data, etc.) */
  observacoesEntrega: text("observacoes_entrega"),
  /** Data de confirmação da entrega */
  dataConfirmacao: timestamp("data_confirmacao"),
  /** URL da página da vaga para conferência de entrega */
  payloadPagina: text("payload_pagina"),
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


/**
 * Tabela de configurações de notificação do usuário
 * Armazena preferências de notificação via WhatsApp
 */
export const notificacoesConfig = mysqlTable("notificacoes_config", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Número de WhatsApp do usuário (formato: +5511999999999) */
  whatsappNumero: varchar("whatsapp_numero", { length: 20 }),
  /** Se notificações estão ativadas */
  notificacoesAtivadas: boolean("notificacoes_ativadas").default(false).notNull(),
  /** Notificar quando novas vagas forem encontradas */
  notificarNovasVagas: boolean("notificar_novas_vagas").default(true).notNull(),
  /** Notificar quando status de candidatura mudar */
  notificarStatusCandidatura: boolean("notificar_status_candidatura").default(true).notNull(),
  /** Notificar lembretes de follow-up */
  notificarFollowUp: boolean("notificar_follow_up").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificacaoConfig = typeof notificacoesConfig.$inferSelect;
export type InsertNotificacaoConfig = typeof notificacoesConfig.$inferInsert;

/**
 * Tabela de grupos WhatsApp para publicação de vagas
 * Armazena links de grupos onde as vagas serão compartilhadas
 */
export const whatsappGrupos = mysqlTable("whatsapp_grupos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Nome do grupo */
  nomeGrupo: varchar("nome_grupo", { length: 255 }).notNull(),
  /** Link de convite do grupo WhatsApp */
  linkGrupo: text("link_grupo").notNull(),
  /** Se o grupo está ativo para receber notificações */
  ativo: boolean("ativo").default(true).notNull(),
  /** Descrição opcional do grupo */
  descricao: text("descricao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappGrupo = typeof whatsappGrupos.$inferSelect;
export type InsertWhatsappGrupo = typeof whatsappGrupos.$inferInsert;

/**
 * Tabela de histórico de notificações enviadas
 * Registra todas as notificações enviadas via WhatsApp
 */
export const notificacoesHistorico = mysqlTable("notificacoes_historico", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Tipo de notificação */
  tipo: mysqlEnum("tipo", ["nova_vaga", "status_candidatura", "follow_up", "sistema"]).notNull(),
  /** Destinatário (número WhatsApp ou ID do grupo) */
  destinatario: varchar("destinatario", { length: 255 }).notNull(),
  /** Título da notificação */
  titulo: varchar("titulo", { length: 255 }).notNull(),
  /** Mensagem enviada */
  mensagem: text("mensagem").notNull(),
  /** Status do envio */
  statusEnvio: mysqlEnum("status_envio", ["pendente", "enviado", "erro", "entregue"]).notNull().default("pendente"),
  /** Mensagem de erro (se houver) */
  mensagemErro: text("mensagem_erro"),
  /** ID externo da mensagem (Twilio, WhatsApp Business API, etc.) */
  idExterno: varchar("id_externo", { length: 255 }),
  /** Data de envio */
  dataEnvio: timestamp("data_envio"),
  /** Dados adicionais (JSON) */
  dadosAdicionais: text("dados_adicionais"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NotificacaoHistorico = typeof notificacoesHistorico.$inferSelect;
export type InsertNotificacaoHistorico = typeof notificacoesHistorico.$inferInsert;


/**
 * Tabela de planos de assinatura
 * Define os planos disponíveis com preços e módulos permitidos
 */
export const planos = mysqlTable("planos", {
  id: int("id").autoincrement().primaryKey(),
  /** Nome do plano (ex: Básico, Premium, Enterprise) */
  nome: varchar("nome", { length: 100 }).notNull(),
  /** Descrição do plano */
  descricao: text("descricao"),
  /** Preço mensal em centavos (ex: 9900 = R$ 99,00) */
  precoMensal: int("preco_mensal").notNull(),
  /** Preço anual em centavos (ex: 99000 = R$ 990,00) */
  precoAnual: int("preco_anual"),
  /** Módulos permitidos (JSON array) */
  modulosPermitidos: text("modulos_permitidos").notNull(),
  /** Limite de currículos por mês */
  limiteCurriculos: int("limite_curriculos").default(10),
  /** Limite de candidaturas por mês */
  limiteCandidaturas: int("limite_candidaturas").default(50),
  /** Se o plano está ativo */
  ativo: boolean("ativo").default(true).notNull(),
  /** Ordem de exibição */
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plano = typeof planos.$inferSelect;
export type InsertPlano = typeof planos.$inferInsert;

/**
 * Tabela de assinaturas de usuários
 * Vincula usuários a planos com controle de validade
 */
export const assinaturas = mysqlTable("assinaturas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planoId: int("planoId").notNull(),
  /** Status da assinatura */
  status: mysqlEnum("status", ["ativa", "cancelada", "expirada", "trial"]).notNull().default("ativa"),
  /** Data de início da assinatura */
  dataInicio: timestamp("data_inicio").defaultNow().notNull(),
  /** Data de fim da assinatura */
  dataFim: timestamp("data_fim"),
  /** Se renovação automática está ativada */
  renovacaoAutomatica: boolean("renovacao_automatica").default(true).notNull(),
  /** Método de pagamento */
  metodoPagamento: varchar("metodo_pagamento", { length: 50 }),
  /** ID da transação externa (Stripe, PagSeguro, etc.) */
  transacaoId: varchar("transacao_id", { length: 255 }),
  /** Observações */
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Assinatura = typeof assinaturas.$inferSelect;
export type InsertAssinatura = typeof assinaturas.$inferInsert;

/**
 * Tabela de uso de recursos por usuário
 * Controla limites de uso mensal
 */
export const usoRecursos = mysqlTable("uso_recursos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Mês de referência (formato: YYYY-MM) */
  mesReferencia: varchar("mes_referencia", { length: 7 }).notNull(),
  /** Quantidade de currículos enviados no mês */
  curriculosEnviados: int("curriculos_enviados").default(0),
  /** Quantidade de candidaturas realizadas no mês */
  candidaturasRealizadas: int("candidaturas_realizadas").default(0),
  /** Quantidade de análises de compatibilidade realizadas */
  analisesRealizadas: int("analises_realizadas").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsoRecurso = typeof usoRecursos.$inferSelect;
export type InsertUsoRecurso = typeof usoRecursos.$inferInsert;
