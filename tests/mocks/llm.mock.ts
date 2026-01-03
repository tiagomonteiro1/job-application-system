/**
 * Mock do cliente LLM para testes
 */

import { vi } from 'vitest';

export const mockLLMResponse = {
  analise: {
    pontos_fortes: [
      '24 anos de experiência em desenvolvimento',
      'Expertise em e-commerce (Magento, AEM)',
      'Forte conhecimento em cloud (AWS, Azure, GCP)',
    ],
    pontos_fracos: [
      'Certificações de segurança não mencionadas',
      'Experiência com testes automatizados não destacada',
    ],
    sugestoes: [
      'Adicionar certificações relevantes (AWS, Azure)',
      'Destacar projetos open source',
      'Incluir métricas de performance',
    ],
    score_geral: 85,
  },
  curriculo_refatorado: `# TIAGO FARIA MONTEIRO
Senior Software Engineer | E-commerce & Cloud Specialist

## RESUMO PROFISSIONAL
Engenheiro de Software com 24 anos de experiência...`,
  
  carta_apresentacao: `Prezado(a) Recrutador(a),

Venho por meio desta demonstrar meu interesse na vaga de Desenvolvedor PHP Sênior...`,

  compatibilidade: {
    score: 92,
    requisitos_atendidos: [
      'PHP avançado - 10+ anos de experiência',
      'Cloud AWS/Azure - Projetos em produção',
      'E-commerce - Magento 2 specialist',
    ],
    requisitos_faltantes: [
      'Certificação AWS Solutions Architect',
    ],
    competencias_destacadas: [
      'Arquitetura de microserviços',
      'Liderança técnica',
      'DevOps e CI/CD',
    ],
    gaps_conhecimento: [
      'Kubernetes avançado',
    ],
    recomendacoes: [
      'Curso: AWS Solutions Architect Professional',
      'Certificação: Kubernetes Administrator (CKA)',
    ],
  },
};

export const mockLLMClient = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockLLMResponse.analise),
            },
          },
        ],
      }),
    },
  },
};

export const createMockLLMResponse = (customResponse?: Partial<typeof mockLLMResponse>) => {
  return {
    ...mockLLMResponse,
    ...customResponse,
  };
};
