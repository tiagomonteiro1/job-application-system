/**
 * Serviço de Cron Job para Envio Automático de Follow-ups
 * 
 * Este serviço roda em intervalos regulares e verifica follow-ups pendentes
 * que estão prontos para serem enviados, enviando-os automaticamente via
 * WhatsApp ou Email conforme configurado.
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';

// Intervalo de verificação: a cada 1 hora (3600000ms)
const CRON_INTERVAL = 60 * 60 * 1000;

interface FollowupPendente {
  id: number;
  candidatura_id: number;
  usuario_id: number;
  scheduled_date: Date;
  template_used: string | null;
  vaga_titulo: string;
  vaga_empresa: string;
  usuario_nome: string;
  usuario_email: string;
  whatsapp_numero: string | null;
  notificacoes_ativadas: boolean;
}

/**
 * Busca follow-ups pendentes que estão prontos para serem enviados
 */
async function buscarFollowupsPendentes(): Promise<FollowupPendente[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const query = sql`
    SELECT 
      f.id,
      f.candidatura_id,
      f.usuario_id,
      f.scheduled_date,
      f.template_used,
      c.vaga_titulo,
      c.vaga_empresa,
      u.name as usuario_nome,
      u.email as usuario_email,
      nc.whatsapp_numero,
      nc.notificacoes_ativadas
    FROM followups f
    INNER JOIN candidaturas c ON f.candidatura_id = c.id
    INNER JOIN user u ON f.usuario_id = u.id
    LEFT JOIN notificacoes_config nc ON u.id = nc.usuario_id
    WHERE f.status = 'pendente'
      AND f.scheduled_date <= NOW()
    ORDER BY f.scheduled_date ASC
    LIMIT 50
  `;

  const result: any = await db.execute(query);
  return Array.isArray(result) ? result as FollowupPendente[] : [];
}

/**
 * Envia follow-up via WhatsApp
 */
async function enviarViaWhatsApp(followup: FollowupPendente, mensagem: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    // TODO: Integrar com API do WhatsApp (Twilio, WhatsApp Business API, etc.)
    console.log(`[CRON] Enviando follow-up via WhatsApp para ${followup.whatsapp_numero}`);
    console.log(`[CRON] Mensagem: ${mensagem}`);

    // Registrar no histórico de notificações
    await db.execute(sql`
      INSERT INTO notificacoes_historico (
        usuario_id,
        tipo,
        destinatario,
        titulo,
        mensagem,
        status_envio,
        data_envio
      ) VALUES (
        ${followup.usuario_id},
        'follow_up',
        ${followup.whatsapp_numero},
        'Follow-up de Candidatura',
        ${mensagem},
        'enviado',
        NOW()
      )
    `);

    return true;
  } catch (error) {
    console.error('[CRON] Erro ao enviar WhatsApp:', error);
    return false;
  }
}

/**
 * Envia follow-up via Email
 */
async function enviarViaEmail(followup: FollowupPendente, mensagem: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    // TODO: Integrar com serviço de email (SendGrid, AWS SES, etc.)
    console.log(`[CRON] Enviando follow-up via Email para ${followup.usuario_email}`);
    console.log(`[CRON] Mensagem: ${mensagem}`);

    // Registrar no histórico de notificações
    await db.execute(sql`
      INSERT INTO notificacoes_historico (
        usuario_id,
        tipo,
        destinatario,
        titulo,
        mensagem,
        status_envio,
        data_envio
      ) VALUES (
        ${followup.usuario_id},
        'follow_up',
        ${followup.usuario_email},
        'Follow-up de Candidatura',
        ${mensagem},
        'enviado',
        NOW()
      )
    `);

    return true;
  } catch (error) {
    console.error('[CRON] Erro ao enviar Email:', error);
    return false;
  }
}

/**
 * Gera mensagem de follow-up baseada no template
 */
function gerarMensagem(followup: FollowupPendente, template: string | null): string {
  const mensagemPadrao = `Olá! Gostaria de acompanhar o status da minha candidatura para a vaga de ${followup.vaga_titulo} na empresa ${followup.vaga_empresa}. Continuo muito interessado(a) na oportunidade e estou à disposição para qualquer informação adicional.`;

  if (!template) {
    return mensagemPadrao;
  }

  // Substituir variáveis no template
  return template
    .replace(/{nome_empresa}/g, followup.vaga_empresa)
    .replace(/{cargo}/g, followup.vaga_titulo)
    .replace(/{nome_usuario}/g, followup.usuario_nome)
    .replace(/{data_candidatura}/g, new Date().toLocaleDateString('pt-BR'));
}

/**
 * Marca follow-up como enviado
 */
async function marcarComoEnviado(followupId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.execute(sql`
    UPDATE followups
    SET status = 'enviado',
        sent_date = NOW()
    WHERE id = ${followupId}
  `);
}

/**
 * Marca follow-up como falho
 */
async function marcarComoFalho(followupId: number, erro: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.execute(sql`
    UPDATE followups
    SET status = 'falhou'
    WHERE id = ${followupId}
  `);

  console.error(`[CRON] Follow-up ${followupId} falhou: ${erro}`);
}

/**
 * Processa um follow-up pendente
 */
async function processarFollowup(followup: FollowupPendente): Promise<void> {
  try {
    console.log(`[CRON] Processando follow-up #${followup.id} para ${followup.usuario_nome}`);

    // Gerar mensagem
    const mensagem = gerarMensagem(followup, followup.template_used);

    // Determinar canal de envio (prioriza WhatsApp se disponível)
    let enviado = false;

    if (followup.whatsapp_numero && followup.notificacoes_ativadas) {
      enviado = await enviarViaWhatsApp(followup, mensagem);
    }

    // Se não foi enviado via WhatsApp, tenta email
    if (!enviado) {
      enviado = await enviarViaEmail(followup, mensagem);
    }

    // Atualizar status
    if (enviado) {
      await marcarComoEnviado(followup.id);
      console.log(`[CRON] ✅ Follow-up #${followup.id} enviado com sucesso`);
    } else {
      await marcarComoFalho(followup.id, 'Falha ao enviar por todos os canais');
    }
  } catch (error) {
    console.error(`[CRON] Erro ao processar follow-up #${followup.id}:`, error);
    await marcarComoFalho(followup.id, error instanceof Error ? error.message : 'Erro desconhecido');
  }
}

/**
 * Execução principal do cron job
 */
async function executarCronJob(): Promise<void> {
  try {
    console.log('[CRON] Iniciando verificação de follow-ups pendentes...');

    const followupsPendentes = await buscarFollowupsPendentes();

    if (followupsPendentes.length === 0) {
      console.log('[CRON] Nenhum follow-up pendente encontrado');
      return;
    }

    console.log(`[CRON] Encontrados ${followupsPendentes.length} follow-ups pendentes`);

    // Processar cada follow-up sequencialmente
    for (const followup of followupsPendentes) {
      await processarFollowup(followup);
      // Pequeno delay entre envios para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('[CRON] ✅ Verificação concluída');
  } catch (error) {
    console.error('[CRON] Erro na execução do cron job:', error);
  }
}

/**
 * Inicia o serviço de cron job
 */
export function iniciarCronJob(): void {
  console.log('[CRON] Serviço de follow-ups automáticos iniciado');
  console.log(`[CRON] Intervalo de verificação: ${CRON_INTERVAL / 1000 / 60} minutos`);

  // Executar imediatamente na inicialização
  executarCronJob();

  // Agendar execuções periódicas
  setInterval(executarCronJob, CRON_INTERVAL);
}

/**
 * Execução manual do cron (para testes)
 */
export async function executarManualmente(): Promise<void> {
  console.log('[CRON] Execução manual solicitada');
  await executarCronJob();
}
