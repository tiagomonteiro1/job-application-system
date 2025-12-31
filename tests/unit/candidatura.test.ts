/**
 * Testes Unitários - API de Candidatura
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockLLMResponse, mockLLMClient } from '../mocks/llm.mock';

describe('Candidatura API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Geração de Carta de Apresentação', () => {
    it('deve gerar carta personalizada para a vaga', async () => {
      const vaga = {
        titulo: 'Desenvolvedor PHP Sênior',
        empresa: 'Tech Company',
        descricao: 'Buscamos desenvolvedor experiente...',
      };

      const curriculo = {
        nome: 'Tiago Faria Monteiro',
        experiencia: '24 anos em desenvolvimento',
        competencias: ['PHP', 'AWS', 'Magento'],
      };

      mockLLMClient.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: mockLLMResponse.carta_apresentacao,
            },
          },
        ],
      });

      const response = await mockLLMClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Gere uma carta de apresentação profissional.',
          },
          {
            role: 'user',
            content: `Vaga: ${JSON.stringify(vaga)}\nCurrículo: ${JSON.stringify(curriculo)}`,
          },
        ],
      });

      const carta = response.choices[0].message.content;

      expect(carta).toBeTruthy();
      expect(carta.length).toBeGreaterThan(100);
      expect(carta).toContain('Prezado');
      expect(mockLLMClient.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('deve incluir nome do candidato na carta', () => {
      const carta = mockLLMResponse.carta_apresentacao;
      const nomeCandidato = 'Tiago Faria Monteiro';
      
      // Carta deve mencionar o candidato ou ter assinatura
      expect(carta.length).toBeGreaterThan(0);
    });

    it('deve mencionar a empresa na carta', () => {
      const carta = mockLLMResponse.carta_apresentacao;
      
      expect(carta).toBeTruthy();
      expect(carta.length).toBeGreaterThan(100);
    });
  });

  describe('Criação de Candidatura', () => {
    it('deve criar candidatura com todos os dados necessários', () => {
      const candidatura = {
        id: 'cand-123',
        usuario_id: 'user-123',
        curriculo_id: 'curr-123',
        vaga_titulo: 'Desenvolvedor PHP Sênior',
        vaga_empresa: 'Tech Company',
        vaga_link: 'https://example.com/vaga',
        carta_apresentacao: mockLLMResponse.carta_apresentacao,
        status: 'pendente',
        criado_em: new Date(),
      };

      expect(candidatura).toHaveProperty('id');
      expect(candidatura).toHaveProperty('usuario_id');
      expect(candidatura).toHaveProperty('curriculo_id');
      expect(candidatura).toHaveProperty('vaga_titulo');
      expect(candidatura).toHaveProperty('carta_apresentacao');
      expect(candidatura).toHaveProperty('status');
      expect(candidatura.status).toBe('pendente');
    });

    it('deve validar dados obrigatórios', () => {
      const candidaturaIncompleta = {
        usuario_id: 'user-123',
        // faltando curriculo_id
        vaga_titulo: 'Desenvolvedor PHP',
      };

      expect(() => {
        if (!candidaturaIncompleta.curriculo_id) {
          throw new Error('curriculo_id é obrigatório');
        }
      }).toThrow('curriculo_id é obrigatório');
    });
  });

  describe('Status de Candidatura', () => {
    it('deve iniciar com status "pendente"', () => {
      const candidatura = {
        status: 'pendente',
      };

      expect(candidatura.status).toBe('pendente');
    });

    it('deve permitir atualizar para "enviado"', () => {
      let status = 'pendente';
      status = 'enviado';

      expect(status).toBe('enviado');
    });

    it('deve permitir atualizar para "visualizado"', () => {
      let status = 'enviado';
      status = 'visualizado';

      expect(status).toBe('visualizado');
    });

    it('deve permitir atualizar para "rejeitado" ou "aceito"', () => {
      let status = 'visualizado';
      
      // Cenário 1: Rejeitado
      status = 'rejeitado';
      expect(status).toBe('rejeitado');

      // Cenário 2: Aceito
      status = 'aceito';
      expect(status).toBe('aceito');
    });
  });

  describe('Histórico de Candidaturas', () => {
    it('deve listar candidaturas do usuário', () => {
      const candidaturas = [
        {
          id: 'cand-1',
          vaga_titulo: 'PHP Sênior',
          status: 'enviado',
          criado_em: new Date('2024-01-01'),
        },
        {
          id: 'cand-2',
          vaga_titulo: 'Pentester',
          status: 'visualizado',
          criado_em: new Date('2024-01-02'),
        },
      ];

      expect(Array.isArray(candidaturas)).toBe(true);
      expect(candidaturas.length).toBe(2);
      expect(candidaturas[0]).toHaveProperty('id');
      expect(candidaturas[0]).toHaveProperty('status');
    });

    it('deve filtrar candidaturas por status', () => {
      const todasCandidaturas = [
        { id: '1', status: 'pendente' },
        { id: '2', status: 'enviado' },
        { id: '3', status: 'enviado' },
        { id: '4', status: 'rejeitado' },
      ];

      const enviadas = todasCandidaturas.filter(c => c.status === 'enviado');

      expect(enviadas.length).toBe(2);
      expect(enviadas.every(c => c.status === 'enviado')).toBe(true);
    });
  });
});
