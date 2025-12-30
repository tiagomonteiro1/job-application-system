import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createCandidatura, getCandidaturasByUserId, updateCandidatura } from "../db";
import { getCurriculoById } from "../db";
import { invokeLLM } from "../_core/llm";

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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

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
      });

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
});
