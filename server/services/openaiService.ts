/**
 * Serviço de Integração com OpenAI GPT-4
 * Análise e refatoração de currículos com IA
 */

import OpenAI from 'openai';

export interface ResumeAnalysis {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
  experienceLevel: 'junior' | 'pleno' | 'senior' | 'especialista';
  topSkills: string[];
}

export interface JobCompatibility {
  score: number; // 0-100
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  coverLetterSuggestion: string;
}

export interface ResumeRefactoring {
  improvedResume: string;
  changes: string[];
  highlights: string[];
}

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Analisa um currículo e retorna pontuação e sugestões
   */
  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    const prompt = `
Analise o seguinte currículo profissional e forneça uma avaliação detalhada:

${resumeText}

Retorne a análise no seguinte formato JSON:
{
  "score": <número de 0 a 100>,
  "strengths": [<lista de pontos fortes>],
  "weaknesses": [<lista de pontos fracos>],
  "suggestions": [<lista de sugestões de melhoria>],
  "keywords": [<palavras-chave relevantes encontradas>],
  "experienceLevel": "<junior|pleno|senior|especialista>",
  "topSkills": [<principais habilidades identificadas>]
}

Seja específico e construtivo nas sugestões.
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em recursos humanos e análise de currículos. Forneça análises detalhadas e construtivas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      return JSON.parse(content) as ResumeAnalysis;
    } catch (error) {
      console.error('Erro ao analisar currículo:', error);
      throw error;
    }
  }

  /**
   * Refatora um currículo para melhorar sua qualidade
   */
  async refactorResume(resumeText: string, targetRole?: string): Promise<ResumeRefactoring> {
    const prompt = `
Refatore o seguinte currículo para torná-lo mais profissional e atraente:

${resumeText}

${targetRole ? `Foco na vaga: ${targetRole}` : ''}

Retorne a refatoração no seguinte formato JSON:
{
  "improvedResume": "<currículo melhorado em formato markdown>",
  "changes": [<lista de mudanças realizadas>],
  "highlights": [<principais melhorias>]
}

Diretrizes:
- Melhorar redação e gramática
- Destacar conquistas com métricas
- Usar verbos de ação
- Organizar informações de forma clara
- Remover informações irrelevantes
- Adicionar palavras-chave relevantes
- Manter formatação profissional
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em redação de currículos profissionais. Crie currículos impactantes e bem estruturados.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      return JSON.parse(content) as ResumeRefactoring;
    } catch (error) {
      console.error('Erro ao refatorar currículo:', error);
      throw error;
    }
  }

  /**
   * Calcula compatibilidade entre currículo e vaga
   */
  async calculateCompatibility(
    resumeText: string,
    jobDescription: string
  ): Promise<JobCompatibility> {
    const prompt = `
Analise a compatibilidade entre o currículo e a vaga:

CURRÍCULO:
${resumeText}

DESCRIÇÃO DA VAGA:
${jobDescription}

Retorne a análise no seguinte formato JSON:
{
  "score": <número de 0 a 100 indicando compatibilidade>,
  "matchingSkills": [<habilidades que o candidato possui e a vaga requer>],
  "missingSkills": [<habilidades que a vaga requer mas o candidato não possui>],
  "recommendations": [<recomendações para aumentar compatibilidade>],
  "coverLetterSuggestion": "<sugestão de carta de apresentação personalizada>"
}

Seja objetivo e específico.
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em recrutamento e seleção. Analise compatibilidade entre candidatos e vagas de forma precisa.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      return JSON.parse(content) as JobCompatibility;
    } catch (error) {
      console.error('Erro ao calcular compatibilidade:', error);
      throw error;
    }
  }

  /**
   * Gera carta de apresentação personalizada
   */
  async generateCoverLetter(
    resumeText: string,
    jobDescription: string,
    companyName: string
  ): Promise<string> {
    const prompt = `
Crie uma carta de apresentação profissional e personalizada:

CURRÍCULO DO CANDIDATO:
${resumeText}

VAGA:
${jobDescription}

EMPRESA:
${companyName}

Crie uma carta de apresentação que:
- Seja profissional e persuasiva
- Destaque as qualificações mais relevantes
- Demonstre entusiasmo pela vaga
- Seja concisa (máximo 3 parágrafos)
- Use tom formal mas amigável
- Mencione a empresa e a vaga especificamente

Retorne apenas o texto da carta, sem formatação JSON.
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em redação de cartas de apresentação profissionais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Erro ao gerar carta de apresentação:', error);
      throw error;
    }
  }

  /**
   * Extrai informações estruturadas de um currículo
   */
  async extractResumeData(resumeText: string): Promise<any> {
    const prompt = `
Extraia as seguintes informações do currículo:

${resumeText}

Retorne no formato JSON:
{
  "name": "<nome completo>",
  "email": "<email>",
  "phone": "<telefone>",
  "location": "<cidade, estado>",
  "summary": "<resumo profissional>",
  "experience": [
    {
      "title": "<cargo>",
      "company": "<empresa>",
      "period": "<período>",
      "description": "<descrição>"
    }
  ],
  "education": [
    {
      "degree": "<grau>",
      "institution": "<instituição>",
      "year": "<ano>"
    }
  ],
  "skills": [<lista de habilidades>],
  "languages": [<lista de idiomas>],
  "certifications": [<lista de certificações>]
}
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em extração de dados de currículos. Extraia informações de forma precisa e estruturada.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Erro ao extrair dados do currículo:', error);
      throw error;
    }
  }

  /**
   * Gera sugestões de melhoria para perfil do LinkedIn
   */
  async suggestLinkedInImprovements(profileText: string): Promise<string[]> {
    const prompt = `
Analise o seguinte perfil do LinkedIn e sugira melhorias:

${profileText}

Forneça 5-10 sugestões específicas e acionáveis para melhorar o perfil.
Retorne como array JSON de strings.
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em otimização de perfis do LinkedIn.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      const parsed = JSON.parse(content);
      return parsed.suggestions || [];
    } catch (error) {
      console.error('Erro ao gerar sugestões LinkedIn:', error);
      throw error;
    }
  }
}

// Exportar instância singleton
let openaiService: OpenAIService | null = null;

export function getOpenAIService(): OpenAIService {
  if (!openaiService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }
    openaiService = new OpenAIService(apiKey);
  }
  return openaiService;
}
