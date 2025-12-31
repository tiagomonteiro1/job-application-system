import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getCurriculoById } from "../db";
import { invokeLLM } from "../_core/llm";
import { requireModuloAccess, requireLimiteRecurso, MODULOS } from "../acl";
import { incrementarUsoRecurso } from "../db";

const vagaSchema = z.object({
  id: z.number(),
  titulo: z.string(),
  empresa: z.string(),
  area: z.string(),
  requisitos: z.array(z.string()).optional(),
  beneficios: z.array(z.string()).optional(),
  motivo: z.string().optional(),
});

export const compatibilidadeRouter = router({
  /**
   * Analisar compatibilidade entre currículo e vaga
   * Retorna score, requisitos atendidos/faltantes, gaps e recomendações
   */
  analisar: protectedProcedure
    .input(
      z.object({
        curriculoId: z.number(),
        vaga: vagaSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // Verificar acesso ao módulo de compatibilidade
      await requireModuloAccess(userId, ctx.user.role, MODULOS.COMPATIBILIDADE);
      
      // Verificar limite de análises
      await requireLimiteRecurso(userId, ctx.user.role, 'analises');

      // Buscar currículo
      const curriculo = await getCurriculoById(input.curriculoId);
      if (!curriculo || curriculo.userId !== userId) {
        throw new Error("Currículo não encontrado");
      }

      if (curriculo.status !== "analyzed") {
        throw new Error("Currículo precisa ser analisado antes de comparar com vagas");
      }

      // Preparar dados da vaga
      const vagaInfo = `
**Vaga:** ${input.vaga.titulo}
**Empresa:** ${input.vaga.empresa}
**Área:** ${input.vaga.area}
${input.vaga.requisitos ? `**Requisitos:** ${input.vaga.requisitos.join(", ")}` : ""}
${input.vaga.motivo ? `**Descrição:** ${input.vaga.motivo}` : ""}
`;

      // Análise de compatibilidade com IA
      const analiseResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um especialista em recrutamento e análise de compatibilidade entre candidatos e vagas.

Sua tarefa é analisar a compatibilidade entre um currículo e uma vaga, fornecendo uma análise detalhada e objetiva.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com a seguinte estrutura:
{
  "score": 85,
  "requisitosAtendidos": [
    { "requisito": "PHP avançado", "evidencia": "10+ anos de experiência com PHP e frameworks modernos" },
    { "requisito": "Cloud AWS", "evidencia": "Expertise em AWS, redução de custos em 35%" }
  ],
  "requisitosFaltantes": [
    { "requisito": "Python", "nivel": "intermediário", "prioridade": "média" }
  ],
  "competenciasDestacadas": [
    "Liderança técnica com experiência em times grandes",
    "Especialista em e-commerce e alta performance"
  ],
  "gaps": [
    { "area": "Python", "descricao": "Linguagem não mencionada no currículo", "impacto": "médio" }
  ],
  "recomendacoes": [
    { "tipo": "curso", "titulo": "Python para Desenvolvedores PHP", "razao": "Complementar stack backend" },
    { "tipo": "certificação", "titulo": "AWS Solutions Architect", "razao": "Validar expertise em cloud" }
  ],
  "pontosFortesParaVaga": [
    "Experiência sólida em PHP e frameworks modernos",
    "Histórico comprovado em e-commerce de grande porte"
  ],
  "observacoes": "Candidato altamente qualificado com experiência direta na área"
}

Regras:
- Score de 0-100 baseado em compatibilidade real
- Seja objetivo e específico nas evidências
- Identifique gaps reais que podem impactar a candidatura
- Recomendações devem ser práticas e relevantes
- Priorize qualidade sobre quantidade`,
          },
          {
            role: "user",
            content: `Analise a compatibilidade entre este currículo e esta vaga:

**CURRÍCULO:**
${curriculo.curriculoRefatorado || curriculo.originalText}

**VAGA:**
${vagaInfo}`,
          },
        ],
      });

      const analiseContent = typeof analiseResponse.choices[0]?.message?.content === 'string'
        ? analiseResponse.choices[0].message.content
        : "";

      // Parse do JSON retornado pela IA
      let analiseData;
      try {
        // Limpar possíveis markdown code blocks
        const cleanContent = analiseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analiseData = JSON.parse(cleanContent);
      } catch (error) {
        console.error("Erro ao fazer parse da análise:", error);
        throw new Error("Erro ao processar análise de compatibilidade");
      }

      // Incrementar contador de uso
      const mesAtual = new Date().toISOString().slice(0, 7);
      await incrementarUsoRecurso(userId, mesAtual, 'analises');
      
      return {
        score: analiseData.score || 0,
        requisitosAtendidos: analiseData.requisitosAtendidos || [],
        requisitosFaltantes: analiseData.requisitosFaltantes || [],
        competenciasDestacadas: analiseData.competenciasDestacadas || [],
        gaps: analiseData.gaps || [],
        recomendacoes: analiseData.recomendacoes || [],
        pontosFortesParaVaga: analiseData.pontosFortesParaVaga || [],
        observacoes: analiseData.observacoes || "",
      };
    }),
});
