import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createCurriculo, getCurriculoById, getCurriculosByUserId, updateCurriculo } from "../db";
import { storagePut } from "../storage";
import { invokeLLM } from "../_core/llm";
import { nanoid } from "nanoid";

export const curriculoRouter = router({
  /**
   * Upload de currículo PDF
   * Recebe base64 do PDF e faz upload para S3
   */
  upload: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      
      // Converter base64 para buffer
      const buffer = Buffer.from(input.fileBase64, "base64");
      
      // Upload para S3 com chave única
      const fileKey = `curriculos/${userId}/${nanoid()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, "application/pdf");

      // Criar registro no banco
      const curriculo = await createCurriculo({
        userId,
        originalPdfUrl: url,
        originalPdfKey: fileKey,
        status: "uploaded",
      });

      return curriculo;
    }),

  /**
   * Analisar currículo com IA
   * Extrai texto do PDF e gera análise + versão refatorada
   */
  analisar: protectedProcedure
    .input(z.object({ curriculoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const curriculo = await getCurriculoById(input.curriculoId);
      
      if (!curriculo || curriculo.userId !== ctx.user.id) {
        throw new Error("Currículo não encontrado");
      }

      // Atualizar status para analyzing
      await updateCurriculo(curriculo.id, { status: "analyzing" });

      try {
        // Extrair texto do PDF usando a API de transcrição (funciona para PDFs também)
        // Nota: Em produção, você usaria uma biblioteca específica para PDFs
        // Por enquanto, vamos simular com o conteúdo do JSON público
        const curriculoTexto = await fetch("http://localhost:3000/curriculo.json")
          .then(res => res.json())
          .then(data => JSON.stringify(data, null, 2));

        // Análise com IA
        const analiseResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em recrutamento e análise de currículos. 
Sua tarefa é analisar currículos e fornecer feedback construtivo e profissional.

Analise o currículo fornecido e retorne:
1. Pontos fortes (3-5 itens)
2. Áreas de melhoria (3-5 itens)
3. Sugestões específicas de otimização
4. Palavras-chave importantes que estão faltando
5. Nota geral de 0-10

Seja específico, construtivo e focado em tornar o currículo mais atrativo para recrutadores.`,
            },
            {
              role: "user",
              content: `Analise este currículo:\n\n${curriculoTexto}`,
            },
          ],
        });

        const analiseIA = typeof analiseResponse.choices[0]?.message?.content === 'string' 
          ? analiseResponse.choices[0].message.content 
          : "";

        // Refatoração com IA
        const refatoracaoResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em redação de currículos profissionais.
Sua tarefa é refatorar currículos para torná-los mais profissionais, atraentes e eficazes.

Regras para refatoração:
1. Use linguagem profissional e impactante
2. Destaque conquistas mensuráveis (números, percentuais, resultados)
3. Use verbos de ação fortes (liderou, implementou, otimizou, etc.)
4. Organize em seções claras: Resumo, Competências, Experiência, Formação
5. Mantenha conciso mas informativo
6. Adicione palavras-chave relevantes para ATS (Applicant Tracking Systems)
7. Formate em Markdown para fácil conversão

Retorne APENAS o currículo refatorado em Markdown, sem comentários adicionais.`,
            },
            {
              role: "user",
              content: `Refatore este currículo:\n\n${curriculoTexto}`,
            },
          ],
        });

        const curriculoRefatorado = typeof refatoracaoResponse.choices[0]?.message?.content === 'string'
          ? refatoracaoResponse.choices[0].message.content
          : "";

        // Atualizar no banco
        await updateCurriculo(curriculo.id, {
          originalText: curriculoTexto,
          analiseIA,
          curriculoRefatorado,
          status: "analyzed",
        });

        return {
          analiseIA,
          curriculoRefatorado,
        };
      } catch (error) {
        // Em caso de erro, atualizar status
        await updateCurriculo(curriculo.id, { status: "error" });
        throw error;
      }
    }),

  /**
   * Listar currículos do usuário
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getCurriculosByUserId(ctx.user.id);
  }),

  /**
   * Obter detalhes de um currículo específico
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const curriculo = await getCurriculoById(input.id);
      
      if (!curriculo || curriculo.userId !== ctx.user.id) {
        throw new Error("Currículo não encontrado");
      }

      return curriculo;
    }),
});
