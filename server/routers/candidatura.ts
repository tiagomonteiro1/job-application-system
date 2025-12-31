import { z } from "zod";
import { sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { createCandidatura, getCandidaturasByUserId, updateCandidatura } from "../db";
import { getCurriculoById } from "../db";
import { invokeLLM } from "../_core/llm";
import { requireModuloAccess, requireLimiteRecurso, MODULOS } from "../acl";
import { incrementarUsoRecurso } from "../db";

const vagaSchema = z.object({
  id: z.number(),
  titulo: z.string(),
  empresa: z.string(),
  localizacao: z.string(),
  tipo: z.string(),
  link_candidatura: z.string(),
  area: z.string(),
  compatibilidade: z.number(),
  requisitos: z.array(z.string()).optional(),
  motivo: z.string().optional(),
});

export const candidaturaRouter = router({
  /**
   * Criar candidatura com geração automática de carta de apresentação
   */
  criar: protectedProcedure
    .input(
      z.object({
        curriculoId: z.number(),
        vaga: vagaSchema,
        payloadPagina: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // Verificar acesso aos módulos necessários
      await requireModuloAccess(userId, ctx.user.role, MODULOS.CARTA);
      await requireModuloAccess(userId, ctx.user.role, MODULOS.HISTORICO);
      
      // Verificar limite de candidaturas
      await requireLimiteRecurso(userId, ctx.user.role, 'candidaturas');

      // Buscar currículo
      const curriculo = await getCurriculoById(input.curriculoId);
      if (!curriculo || curriculo.userId !== userId) {
        throw new Error("Currículo não encontrado");
      }

      if (curriculo.status !== "analyzed") {
        throw new Error("Currículo precisa ser analisado antes de enviar candidatura");
      }

      // Gerar carta de apresentação com IA
      const cartaResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um especialista em redação de cartas de apresentação profissionais.
Sua tarefa é criar cartas de apresentação personalizadas e impactantes.

Regras para a carta:
1. Seja conciso (máximo 3 parágrafos)
2. Destaque experiências relevantes para a vaga específica
3. Demonstre entusiasmo genuíno pela oportunidade
4. Mencione a empresa e a posição especificamente
5. Use tom profissional mas acessível
6. Inclua call-to-action no final
7. Formate em Markdown

Estrutura sugerida:
- Parágrafo 1: Apresentação e interesse na vaga
- Parágrafo 2: Experiências e habilidades relevantes
- Parágrafo 3: Entusiasmo e disponibilidade

Retorne APENAS a carta em Markdown, sem saudações ou assinaturas (isso será adicionado automaticamente).`,
          },
          {
            role: "user",
            content: `Crie uma carta de apresentação para:

**Vaga:**
- Título: ${input.vaga.titulo}
- Empresa: ${input.vaga.empresa}
- Localização: ${input.vaga.localizacao}
- Tipo: ${input.vaga.tipo}
${input.vaga.requisitos ? `- Requisitos: ${input.vaga.requisitos.join(", ")}` : ""}
${input.vaga.motivo ? `- Por que é compatível: ${input.vaga.motivo}` : ""}

**Meu currículo refatorado:**
${curriculo.curriculoRefatorado || curriculo.originalText || "Não disponível"}`,
          },
        ],
      });

      const cartaApresentacao = typeof cartaResponse.choices[0]?.message?.content === 'string'
        ? cartaResponse.choices[0].message.content
        : "";

      // Criar candidatura
      const candidatura = await createCandidatura({
        userId,
        curriculoId: input.curriculoId,
        vagaData: JSON.stringify(input.vaga),
        cartaApresentacao,
        status: "pending",
        payloadPagina: input.payloadPagina || input.vaga.link_candidatura,
      });
      
      // Incrementar contador de uso
      const mesAtual = new Date().toISOString().slice(0, 7);
      await incrementarUsoRecurso(userId, mesAtual, 'candidaturas');

      // Agendar follow-up automático se configurado
      try {
        const configResult = await ctx.db.execute(sql`
          SELECT * FROM followup_config WHERE userId = ${userId} AND ativo = 1 LIMIT 1
        `);
        
        if (configResult.rows.length > 0) {
          const config = configResult.rows[0] as any;
          const dataAgendada = new Date();
          dataAgendada.setDate(dataAgendada.getDate() + (config.dias_apos_candidatura || 7));
          
          // Buscar template padrão
          const templateResult = await ctx.db.execute(sql`
            SELECT * FROM followup_templates 
            WHERE userId = ${userId} AND ativo = 1 
            ORDER BY createdAt ASC LIMIT 1
          `);
          
          const mensagemPadrao = templateResult.rows.length > 0 
            ? (templateResult.rows[0] as any).mensagem
            : `Olá! Gostaria de acompanhar o status da minha candidatura para a vaga de ${input.vaga.titulo} na ${input.vaga.empresa}. Aguardo retorno. Obrigado!`;
          
          await ctx.db.execute(sql`
            INSERT INTO followups (userId, candidaturaId, data_agendada, mensagem, tipo_envio)
            VALUES (${userId}, ${candidatura.id}, ${dataAgendada.toISOString()}, ${mensagemPadrao}, ${config.enviar_whatsapp ? 'whatsapp' : 'email'})
          `);
        }
      } catch (error) {
        console.error('Erro ao agendar follow-up:', error);
        // Não falhar a candidatura se o follow-up falhar
      }

      return candidatura;
    }),

  /**
   * Enviar candidatura (marca como enviada)
   */
  enviar: protectedProcedure
    .input(z.object({ candidaturaId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await updateCandidatura(input.candidaturaId, {
        status: "sent",
        dataEnvio: new Date(),
      });

      return { success: true };
    }),

  /**
   * Listar histórico de candidaturas do usuário
   */
  historico: protectedProcedure.query(async ({ ctx }) => {
    const candidaturas = await getCandidaturasByUserId(ctx.user.id);
    
    // Parse vagaData de JSON string para objeto
    return candidaturas.map(c => ({
      ...c,
      vagaData: typeof c.vagaData === 'string' ? JSON.parse(c.vagaData) : c.vagaData,
    }));
  }),

  /**
   * Atualizar status de candidatura
   */
  atualizarStatus: protectedProcedure
    .input(
      z.object({
        candidaturaId: z.number(),
        status: z.enum(["pending", "sent", "viewed", "rejected", "accepted"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateCandidatura(input.candidaturaId, {
        status: input.status,
      });

      return { success: true };
    }),

  /**
   * Confirmar entrega de currículo
   */
  confirmarEntrega: protectedProcedure
    .input(
      z.object({
        candidaturaId: z.number(),
        linkValidacao: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateCandidatura(input.candidaturaId, {
        statusEntrega: "confirmado",
        linkValidacao: input.linkValidacao,
        observacoesEntrega: input.observacoes,
        dataConfirmacao: new Date(),
      });

      return { success: true };
    }),

  /**
   * Marcar como não entregue
   */
  marcarNaoEntregue: protectedProcedure
    .input(
      z.object({
        candidaturaId: z.number(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateCandidatura(input.candidaturaId, {
        statusEntrega: "nao_entregue",
        observacoesEntrega: input.observacoes,
      });

      return { success: true };
    }),

  /**
   * Atualizar link de validação
   */
  atualizarLinkValidacao: protectedProcedure
    .input(
      z.object({
        candidaturaId: z.number(),
        linkValidacao: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateCandidatura(input.candidaturaId, {
        linkValidacao: input.linkValidacao,
      });

      return { success: true };
    }),
});
