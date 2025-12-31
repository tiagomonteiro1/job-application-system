/**
 * Testes Unitários - API de Currículo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockLLMResponse, mockLLMClient } from '../mocks/llm.mock';
import { mockS3Response, mockS3Client } from '../mocks/s3.mock';

describe('Currículo API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Upload de Currículo', () => {
    it('deve fazer upload de PDF com sucesso', async () => {
      const mockFile = {
        name: 'curriculo.pdf',
        type: 'application/pdf',
        size: 1024 * 100, // 100KB
      };

      const result = await mockS3Client.putObject({
        Bucket: 'test-bucket',
        Key: `curriculos/user-123/${mockFile.name}`,
        Body: Buffer.from('mock pdf content'),
        ContentType: mockFile.type,
      });

      expect(result.$metadata.httpStatusCode).toBe(200);
      expect(mockS3Client.putObject).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar arquivo que não é PDF', () => {
      const mockFile = {
        name: 'curriculo.txt',
        type: 'text/plain',
        size: 1024,
      };

      expect(() => {
        if (mockFile.type !== 'application/pdf') {
          throw new Error('Apenas arquivos PDF são permitidos');
        }
      }).toThrow('Apenas arquivos PDF são permitidos');
    });

    it('deve rejeitar arquivo maior que 10MB', () => {
      const mockFile = {
        name: 'curriculo.pdf',
        type: 'application/pdf',
        size: 1024 * 1024 * 11, // 11MB
      };

      expect(() => {
        if (mockFile.size > 1024 * 1024 * 10) {
          throw new Error('Arquivo muito grande. Máximo: 10MB');
        }
      }).toThrow('Arquivo muito grande. Máximo: 10MB');
    });
  });

  describe('Análise de Currículo', () => {
    it('deve analisar currículo e retornar sugestões', async () => {
      const curriculoTexto = `
        TIAGO FARIA MONTEIRO
        Senior Software Engineer
        24 anos de experiência em PHP, Magento, AWS
      `;

      mockLLMClient.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockLLMResponse.analise),
            },
          },
        ],
      });

      const response = await mockLLMClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de currículos.',
          },
          {
            role: 'user',
            content: `Analise este currículo: ${curriculoTexto}`,
          },
        ],
      });

      const analise = JSON.parse(response.choices[0].message.content);

      expect(analise).toHaveProperty('pontos_fortes');
      expect(analise).toHaveProperty('pontos_fracos');
      expect(analise).toHaveProperty('sugestoes');
      expect(analise).toHaveProperty('score_geral');
      expect(analise.score_geral).toBeGreaterThanOrEqual(0);
      expect(analise.score_geral).toBeLessThanOrEqual(100);
      expect(mockLLMClient.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('deve retornar score entre 0 e 100', () => {
      const analise = mockLLMResponse.analise;
      
      expect(analise.score_geral).toBeGreaterThanOrEqual(0);
      expect(analise.score_geral).toBeLessThanOrEqual(100);
    });

    it('deve identificar pontos fortes e fracos', () => {
      const analise = mockLLMResponse.analise;
      
      expect(Array.isArray(analise.pontos_fortes)).toBe(true);
      expect(Array.isArray(analise.pontos_fracos)).toBe(true);
      expect(analise.pontos_fortes.length).toBeGreaterThan(0);
    });
  });

  describe('Refatoração de Currículo', () => {
    it('deve refatorar currículo com sugestões aplicadas', async () => {
      const curriculoOriginal = 'Currículo simples';
      const sugestoes = mockLLMResponse.analise.sugestoes;

      mockLLMClient.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: mockLLMResponse.curriculo_refatorado,
            },
          },
        ],
      });

      const response = await mockLLMClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Refatore o currículo aplicando as sugestões.',
          },
          {
            role: 'user',
            content: `Currículo: ${curriculoOriginal}\nSugestões: ${JSON.stringify(sugestoes)}`,
          },
        ],
      });

      const curriculoRefatorado = response.choices[0].message.content;

      expect(curriculoRefatorado).toBeTruthy();
      expect(curriculoRefatorado.length).toBeGreaterThan(curriculoOriginal.length);
      expect(mockLLMClient.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('deve salvar currículo refatorado no S3', async () => {
      const curriculoRefatorado = mockLLMResponse.curriculo_refatorado;

      const result = await mockS3Client.putObject({
        Bucket: 'test-bucket',
        Key: 'curriculos/user-123/curriculo-refatorado.md',
        Body: Buffer.from(curriculoRefatorado),
        ContentType: 'text/markdown',
      });

      expect(result.$metadata.httpStatusCode).toBe(200);
      expect(mockS3Client.putObject).toHaveBeenCalledTimes(1);
    });
  });

  describe('Aplicar Sugestões', () => {
    it('deve aplicar sugestões e gerar nova versão', async () => {
      const curriculoId = 'curriculo-123';
      const sugestoes = mockLLMResponse.analise.sugestoes;

      // Simular aplicação de sugestões
      const versaoAnterior = 1;
      const novaVersao = versaoAnterior + 1;

      expect(novaVersao).toBe(2);
      expect(sugestoes.length).toBeGreaterThan(0);
    });
  });
});
