/**
 * tRPC Router para OpenAI GPT-4
 * Análise e refatoração de currículos com IA
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getOpenAIService } from '../services/openaiService';

export const openaiRouter = router({
  /**
   * Analisar currículo
   */
  analyzeResume: protectedProcedure
    .input(z.object({
      resumeText: z.string()
    }))
    .mutation(async ({ input }) => {
      const service = getOpenAIService();
      const analysis = await service.analyzeResume(input.resumeText);
      
      return {
        success: true,
        analysis
      };
    }),

  /**
   * Refatorar currículo
   */
  refactorResume: protectedProcedure
    .input(z.object({
      resumeText: z.string(),
      targetRole: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const service = getOpenAIService();
      const refactoring = await service.refactorResume(
        input.resumeText,
        input.targetRole
      );
      
      return {
        success: true,
        refactoring
      };
    }),

  /**
   * Calcular compatibilidade vaga vs currículo
   */
  calculateCompatibility: protectedProcedure
    .input(z.object({
      resumeText: z.string(),
      jobDescription: z.string()
    }))
    .mutation(async ({ input }) => {
      const service = getOpenAIService();
      const compatibility = await service.calculateCompatibility(
        input.resumeText,
        input.jobDescription
      );
      
      return {
        success: true,
        compatibility
      };
    }),

  /**
   * Gerar carta de apresentação
   */
  generateCoverLetter: protectedProcedure
    .input(z.object({
      resumeText: z.string(),
      jobDescription: z.string(),
      companyName: z.string()
    }))
    .mutation(async ({ input }) => {
      const service = getOpenAIService();
      const coverLetter = await service.generateCoverLetter(
        input.resumeText,
        input.jobDescription,
        input.companyName
      );
      
      return {
        success: true,
        coverLetter
      };
    }),

  /**
   * Extrair dados estruturados do currículo
   */
  extractResumeData: protectedProcedure
    .input(z.object({
      resumeText: z.string()
    }))
    .mutation(async ({ input }) => {
      const service = getOpenAIService();
      const data = await service.extractResumeData(input.resumeText);
      
      return {
        success: true,
        data
      };
    }),

  /**
   * Sugerir melhorias para LinkedIn
   */
  suggestLinkedInImprovements: protectedProcedure
    .input(z.object({
      profileText: z.string()
    }))
    .mutation(async ({ input }) => {
      const service = getOpenAIService();
      const suggestions = await service.suggestLinkedInImprovements(input.profileText);
      
      return {
        success: true,
        suggestions
      };
    })
});
