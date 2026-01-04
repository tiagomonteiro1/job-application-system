/**
 * Serviço de Integração com WhatsApp Business API
 * Envio de notificações e follow-ups via WhatsApp
 */

import axios from 'axios';

export interface WhatsAppMessage {
  to: string; // Número no formato internacional: +5511999999999
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  components: any[];
}

export interface WhatsAppMessageStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  error?: string;
}

/**
 * Twilio WhatsApp API
 * Documentação: https://www.twilio.com/docs/whatsapp/api
 */
export class TwilioWhatsAppService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string; // Número do Twilio no formato: whatsapp:+14155238886
  private baseURL: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
    this.baseURL = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
  }

  /**
   * Envia mensagem de texto via WhatsApp
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppMessageStatus> {
    try {
      const response = await axios.post(
        `${this.baseURL}/Messages.json`,
        new URLSearchParams({
          From: this.fromNumber,
          To: `whatsapp:${message.to}`,
          Body: message.body,
          ...(message.mediaUrl && { MediaUrl: message.mediaUrl })
        }),
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        id: response.data.sid,
        status: this.mapTwilioStatus(response.data.status),
        timestamp: new Date(response.data.date_created)
      };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return {
        id: '',
        status: 'failed',
        timestamp: new Date(),
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Envia mensagem usando template aprovado
   */
  async sendTemplateMessage(
    to: string,
    template: WhatsAppTemplate
  ): Promise<WhatsAppMessageStatus> {
    try {
      const response = await axios.post(
        `${this.baseURL}/Messages.json`,
        new URLSearchParams({
          From: this.fromNumber,
          To: `whatsapp:${to}`,
          ContentSid: template.name,
          ContentVariables: JSON.stringify(template.components)
        }),
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        id: response.data.sid,
        status: this.mapTwilioStatus(response.data.status),
        timestamp: new Date(response.data.date_created)
      };
    } catch (error: any) {
      console.error('Erro ao enviar template WhatsApp:', error);
      return {
        id: '',
        status: 'failed',
        timestamp: new Date(),
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Verifica status de mensagem enviada
   */
  async getMessageStatus(messageId: string): Promise<WhatsAppMessageStatus> {
    try {
      const response = await axios.get(
        `${this.baseURL}/Messages/${messageId}.json`,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          }
        }
      );

      return {
        id: response.data.sid,
        status: this.mapTwilioStatus(response.data.status),
        timestamp: new Date(response.data.date_updated)
      };
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
      return {
        id: messageId,
        status: 'failed',
        timestamp: new Date(),
        error: error.response?.data?.message || error.message
      };
    }
  }

  private mapTwilioStatus(twilioStatus: string): WhatsAppMessageStatus['status'] {
    switch (twilioStatus) {
      case 'queued':
      case 'sending':
      case 'sent':
        return 'sent';
      case 'delivered':
        return 'delivered';
      case 'read':
        return 'read';
      case 'failed':
      case 'undelivered':
        return 'failed';
      default:
        return 'sent';
    }
  }
}

/**
 * WhatsApp Business Cloud API (Meta)
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export class MetaWhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private baseURL = 'https://graph.facebook.com/v18.0';

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  /**
   * Envia mensagem de texto via WhatsApp
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppMessageStatus> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: message.to.replace('+', ''),
          type: 'text',
          text: {
            preview_url: false,
            body: message.body
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.messages[0].id,
        status: 'sent',
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return {
        id: '',
        status: 'failed',
        timestamp: new Date(),
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Envia mensagem com mídia (imagem, documento, etc)
   */
  async sendMediaMessage(
    to: string,
    mediaType: 'image' | 'document' | 'video',
    mediaUrl: string,
    caption?: string
  ): Promise<WhatsAppMessageStatus> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace('+', ''),
          type: mediaType,
          [mediaType]: {
            link: mediaUrl,
            ...(caption && { caption })
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.messages[0].id,
        status: 'sent',
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('Erro ao enviar mídia WhatsApp:', error);
      return {
        id: '',
        status: 'failed',
        timestamp: new Date(),
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Envia mensagem usando template aprovado
   */
  async sendTemplateMessage(
    to: string,
    template: WhatsAppTemplate
  ): Promise<WhatsAppMessageStatus> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace('+', ''),
          type: 'template',
          template: {
            name: template.name,
            language: {
              code: template.language
            },
            components: template.components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.messages[0].id,
        status: 'sent',
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('Erro ao enviar template WhatsApp:', error);
      return {
        id: '',
        status: 'failed',
        timestamp: new Date(),
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

/**
 * Gerenciador de notificações WhatsApp
 */
export class WhatsAppNotificationManager {
  private service: TwilioWhatsAppService | MetaWhatsAppService;

  constructor(provider: 'twilio' | 'meta', config: any) {
    if (provider === 'twilio') {
      this.service = new TwilioWhatsAppService(
        config.accountSid,
        config.authToken,
        config.fromNumber
      );
    } else {
      this.service = new MetaWhatsAppService(
        config.accessToken,
        config.phoneNumberId
      );
    }
  }

  /**
   * Envia notificação de nova vaga
   */
  async notifyNewJob(to: string, jobTitle: string, company: string, url: string): Promise<WhatsAppMessageStatus> {
    const message = `🎯 *Nova vaga encontrada!*\n\n` +
      `*Cargo:* ${jobTitle}\n` +
      `*Empresa:* ${company}\n\n` +
      `Confira os detalhes: ${url}`;

    return this.service.sendMessage({ to, body: message });
  }

  /**
   * Envia notificação de candidatura enviada
   */
  async notifyApplicationSent(to: string, jobTitle: string, company: string): Promise<WhatsAppMessageStatus> {
    const message = `✅ *Candidatura enviada com sucesso!*\n\n` +
      `*Cargo:* ${jobTitle}\n` +
      `*Empresa:* ${company}\n\n` +
      `Boa sorte! 🍀`;

    return this.service.sendMessage({ to, body: message });
  }

  /**
   * Envia lembrete de follow-up
   */
  async sendFollowUpReminder(
    to: string,
    jobTitle: string,
    company: string,
    daysAgo: number
  ): Promise<WhatsAppMessageStatus> {
    const message = `⏰ *Lembrete de follow-up*\n\n` +
      `Já se passaram ${daysAgo} dias desde sua candidatura para:\n\n` +
      `*Cargo:* ${jobTitle}\n` +
      `*Empresa:* ${company}\n\n` +
      `Que tal enviar um follow-up?`;

    return this.service.sendMessage({ to, body: message });
  }

  /**
   * Envia resumo diário
   */
  async sendDailySummary(
    to: string,
    newJobs: number,
    applicationsSent: number,
    pendingFollowUps: number
  ): Promise<WhatsAppMessageStatus> {
    const message = `📊 *Resumo do dia*\n\n` +
      `🆕 Novas vagas: ${newJobs}\n` +
      `📤 Candidaturas enviadas: ${applicationsSent}\n` +
      `⏰ Follow-ups pendentes: ${pendingFollowUps}\n\n` +
      `Continue assim! 💪`;

    return this.service.sendMessage({ to, body: message });
  }
}

// Exportar instância singleton
let whatsappManager: WhatsAppNotificationManager | null = null;

export function getWhatsAppManager(): WhatsAppNotificationManager {
  if (!whatsappManager) {
    const provider = process.env.WHATSAPP_PROVIDER as 'twilio' | 'meta';
    
    if (provider === 'twilio') {
      whatsappManager = new WhatsAppNotificationManager('twilio', {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_WHATSAPP_NUMBER
      });
    } else {
      whatsappManager = new WhatsAppNotificationManager('meta', {
        accessToken: process.env.META_WHATSAPP_TOKEN,
        phoneNumberId: process.env.META_PHONE_NUMBER_ID
      });
    }
  }
  
  return whatsappManager;
}
