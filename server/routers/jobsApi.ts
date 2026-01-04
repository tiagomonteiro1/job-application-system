/**
 * tRPC Router para APIs de Vagas
 * Busca vagas em tempo real de múltiplas fontes
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { getJobAggregator } from '../services/jobsApi';

export const jobsApiRouter = router({
  /**
   * Buscar vagas em todas as fontes
   */
  searchAllSources: protectedProcedure
    .input(z.object({
      keywords: z.string(),
      location: z.string().optional(),
      jobType: z.string().optional(),
      experienceLevel: z.string().optional(),
      limit: z.number().optional().default(100)
    }))
    .mutation(async ({ input }) => {
      try {
        const aggregator = getJobAggregator();
        const jobs = await aggregator.searchAllSources(input);
        
        return {
          success: true,
          count: jobs.length,
          jobs
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          count: 0,
          jobs: []
        };
      }
    }),

  /**
   * Buscar vagas em fonte específica
   */
  searchBySource: protectedProcedure
    .input(z.object({
      source: z.enum(['linkedin', 'indeed', 'adzuna', 'gupy']),
      keywords: z.string(),
      location: z.string().optional(),
      jobType: z.string().optional(),
      limit: z.number().optional().default(50)
    }))
    .mutation(async ({ input }) => {
      try {
        const aggregator = getJobAggregator();
        const jobs = await aggregator.searchBySource(input.source, {
          keywords: input.keywords,
          location: input.location,
          jobType: input.jobType,
          limit: input.limit
        });
        
        return {
          success: true,
          source: input.source,
          count: jobs.length,
          jobs
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          source: input.source,
          count: 0,
          jobs: []
        };
      }
    }),

  /**
   * Testar conexão com APIs
   */
  testConnection: protectedProcedure
    .query(async () => {
      const hasRapidAPI = !!process.env.RAPIDAPI_KEY;
      const hasAdzuna = !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
      
      return {
        success: true,
        apis: {
          rapidapi: {
            configured: hasRapidAPI,
            services: ['LinkedIn', 'Indeed']
          },
          adzuna: {
            configured: hasAdzuna,
            services: ['Adzuna']
          },
          gupy: {
            configured: true,
            services: ['Gupy']
          }
        }
      };
    })
});
