/**
 * Router tRPC para ACL e informações de plano do usuário
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { 
  verificarAcessoModulo, 
  verificarLimiteRecurso, 
  buscarPlanoUsuario,
  MODULOS,
  type Modulo
} from "../acl";

export const aclRouter = router({
  /**
   * Buscar informações do plano do usuário logado
   */
  meuPlano: protectedProcedure
    .query(async ({ ctx }) => {
      const planoInfo = await buscarPlanoUsuario(ctx.user.id);
      return planoInfo;
    }),

  /**
   * Verificar se tem acesso a um módulo específico
   */
  verificarAcesso: protectedProcedure
    .input(z.object({
      modulo: z.enum([
        MODULOS.VAGAS,
        MODULOS.CURRICULO,
        MODULOS.HISTORICO,
        MODULOS.NOTIFICACOES,
        MODULOS.COMPATIBILIDADE,
        MODULOS.CARTA,
        MODULOS.PDF_PREMIUM,
      ] as [Modulo, ...Modulo[]]),
    }))
    .query(async ({ ctx, input }) => {
      // Admin tem acesso a tudo
      if (ctx.user.role === 'admin') {
        return { temAcesso: true };
      }

      const temAcesso = await verificarAcessoModulo(ctx.user.id, input.modulo);
      return { temAcesso };
    }),

  /**
   * Verificar limite de uso de um recurso
   */
  verificarLimite: protectedProcedure
    .input(z.object({
      tipo: z.enum(['curriculos', 'candidaturas', 'analises']),
    }))
    .query(async ({ ctx, input }) => {
      // Admin não tem limites
      if (ctx.user.role === 'admin') {
        return { 
          permitido: true, 
          usado: 0, 
          limite: 999999,
          porcentagem: 0,
        };
      }

      const resultado = await verificarLimiteRecurso(ctx.user.id, input.tipo);
      
      return {
        ...resultado,
        porcentagem: resultado.limite > 0 
          ? Math.round((resultado.usado / resultado.limite) * 100)
          : 0,
      };
    }),

  /**
   * Listar todos os módulos disponíveis
   */
  listarModulos: protectedProcedure
    .query(async () => {
      return [
        { id: MODULOS.VAGAS, nome: "Vagas Automatizadas", descricao: "Busca automática de vagas compatíveis" },
        { id: MODULOS.CURRICULO, nome: "Currículo", descricao: "Upload e análise de currículo com IA" },
        { id: MODULOS.HISTORICO, nome: "Histórico", descricao: "Histórico de candidaturas" },
        { id: MODULOS.NOTIFICACOES, nome: "Notificações", descricao: "Notificações via WhatsApp" },
        { id: MODULOS.COMPATIBILIDADE, nome: "Análise de Compatibilidade", descricao: "Análise de compatibilidade vaga vs currículo" },
        { id: MODULOS.CARTA, nome: "Carta de Apresentação", descricao: "Geração automática de carta personalizada" },
        { id: MODULOS.PDF_PREMIUM, nome: "PDF Premium", descricao: "Geração de currículo em PDF premium" },
      ];
    }),
});
