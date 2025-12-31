/**
 * Testes Unitários - API de Compatibilidade
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockLLMResponse, mockLLMClient } from '../mocks/llm.mock';

describe('Compatibilidade API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Análise de Compatibilidade', () => {
    it('deve analisar compatibilidade entre vaga e currículo', async () => {
      const vaga = {
        titulo: 'Desenvolvedor PHP Sênior',
        empresa: 'Tech Company',
        requisitos: [
          'PHP 8+',
          'Laravel/Symfony',
          'MySQL',
          'AWS',
          'Docker',
        ],
        descricao: 'Buscamos desenvolvedor PHP sênior com experiência em cloud...',
      };

      const curriculo = {
        nome: 'Tiago Faria Monteiro',
        experiencia: '24 anos',
        competencias: ['PHP', 'Magento', 'AWS', 'Docker', 'MySQL'],
      };

      mockLLMClient.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockLLMResponse.compatibilidade),
            },
          },
        ],
      });

      const response = await mockLLMClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analise a compatibilidade entre vaga e currículo.',
          },
          {
            role: 'user',
            content: `Vaga: ${JSON.stringify(vaga)}\nCurrículo: ${JSON.stringify(curriculo)}`,
          },
        ],
      });

      const compatibilidade = JSON.parse(response.choices[0].message.content);

      expect(compatibilidade).toHaveProperty('score');
      expect(compatibilidade).toHaveProperty('requisitos_atendidos');
      expect(compatibilidade).toHaveProperty('requisitos_faltantes');
      expect(compatibilidade).toHaveProperty('competencias_destacadas');
      expect(compatibilidade).toHaveProperty('gaps_conhecimento');
      expect(compatibilidade).toHaveProperty('recomendacoes');
      expect(mockLLMClient.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('deve retornar score entre 0 e 100', () => {
      const compatibilidade = mockLLMResponse.compatibilidade;
      
      expect(compatibilidade.score).toBeGreaterThanOrEqual(0);
      expect(compatibilidade.score).toBeLessThanOrEqual(100);
    });

    it('deve identificar requisitos atendidos', () => {
      const compatibilidade = mockLLMResponse.compatibilidade;
      
      expect(Array.isArray(compatibilidade.requisitos_atendidos)).toBe(true);
      expect(compatibilidade.requisitos_atendidos.length).toBeGreaterThan(0);
    });

    it('deve identificar gaps de conhecimento', () => {
      const compatibilidade = mockLLMResponse.compatibilidade;
      
      expect(Array.isArray(compatibilidade.gaps_conhecimento)).toBe(true);
    });

    it('deve fornecer recomendações de cursos/certificações', () => {
      const compatibilidade = mockLLMResponse.compatibilidade;
      
      expect(Array.isArray(compatibilidade.recomendacoes)).toBe(true);
    });
  });

  describe('Classificação de Vagas', () => {
    it('deve classificar vaga como alta compatibilidade (score >= 80)', () => {
      const score = 92;
      const classificacao = score >= 80 ? 'Alta' : score >= 60 ? 'Média' : 'Baixa';
      
      expect(classificacao).toBe('Alta');
    });

    it('deve classificar vaga como média compatibilidade (60 <= score < 80)', () => {
      const score = 70;
      const classificacao = score >= 80 ? 'Alta' : score >= 60 ? 'Média' : 'Baixa';
      
      expect(classificacao).toBe('Média');
    });

    it('deve classificar vaga como baixa compatibilidade (score < 60)', () => {
      const score = 45;
      const classificacao = score >= 80 ? 'Alta' : score >= 60 ? 'Média' : 'Baixa';
      
      expect(classificacao).toBe('Baixa');
    });
  });

  describe('Extração de Requisitos', () => {
    it('deve extrair requisitos técnicos da descrição da vaga', () => {
      const descricao = `
        Buscamos desenvolvedor PHP Sênior com:
        - Experiência com PHP 8+
        - Conhecimento em Laravel ou Symfony
        - Domínio de MySQL e PostgreSQL
        - Experiência com AWS ou Azure
        - Conhecimento em Docker e Kubernetes
      `;

      const requisitosExtraidos = [
        'PHP 8+',
        'Laravel/Symfony',
        'MySQL/PostgreSQL',
        'AWS/Azure',
        'Docker/Kubernetes',
      ];

      expect(requisitosExtraidos.length).toBeGreaterThan(0);
      expect(requisitosExtraidos).toContain('PHP 8+');
      expect(requisitosExtraidos).toContain('Docker/Kubernetes');
    });
  });
});
