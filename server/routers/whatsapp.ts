/**
 * tRPC Router para WhatsApp Business API
 * Envio de notificações via WhatsApp
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getWhatsAppManager } from '../services/whatsappService';

export const whatsappRouter = router({
  /**
   * Enviar notificação de nova vaga
   */
  notifyNewJob: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      jobTitle: z.string(),
      company: z.string(),
      url: z.string()
    }))
    .mutation(async ({ input }) => {
      const manager = getWhatsAppManager();
      const status = await manager.notifyNewJob(
        input.phoneNumber,
        input.jobTitle,
        input.company,
        input.url
      );
      
      return {
        success: status.status !== 'failed',
        status
      };
    }),

  /**
   * Enviar notificação de candidatura enviada
   */
  notifyApplicationSent: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      jobTitle: z.string(),
      company: z.string()
    }))
    .mutation(async ({ input }) => {
      const manager = getWhatsAppManager();
      const status = await manager.notifyApplicationSent(
        input.phoneNumber,
        input.jobTitle,
        input.company
      );
      
      return {
        success: status.status !== 'failed',
        status
      };
    }),

  /**
   * Enviar lembrete de follow-up
   */
  sendFollowUpReminder: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      jobTitle: z.string(),
      company: z.string(),
      daysAgo: z.number()
    }))
    .mutation(async ({ input }) => {
      const manager = getWhatsAppManager();
      const status = await manager.sendFollowUpReminder(
        input.phoneNumber,
        input.jobTitle,
        input.company,
        input.daysAgo
      );
      
      return {
        success: status.status !== 'failed',
        status
      };
    }),

  /**
   * Enviar resumo diário
   */
  sendDailySummary: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      newJobs: z.number(),
      applicationsSent: z.number(),
      pendingFollowUps: z.number()
    }))
    .mutation(async ({ input }) => {
      const manager = getWhatsAppManager();
      const status = await manager.sendDailySummary(
        input.phoneNumber,
        input.newJobs,
        input.applicationsSent,
        input.pendingFollowUps
      );
      
      return {
        success: status.status !== 'failed',
        status
      };
    })
});
