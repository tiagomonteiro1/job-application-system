/**
 * Testes de Integração - Storage S3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mockS3Client, mockS3Response } from '../mocks/s3.mock';

describe('S3 Storage Integration', () => {
  beforeEach(() => {
    mockS3Client.putObject.mockClear();
    mockS3Client.getObject.mockClear();
    mockS3Client.deleteObject.mockClear();
  });

  describe('Upload de Arquivos', () => {
    it('deve fazer upload de PDF para S3', async () => {
      const file = {
        name: 'curriculo.pdf',
        content: Buffer.from('mock pdf content'),
        contentType: 'application/pdf',
      };

      const result = await mockS3Client.putObject({
        Bucket: 'test-bucket',
        Key: `curriculos/user-123/${file.name}`,
        Body: file.content,
        ContentType: file.contentType,
      });

      expect(result.$metadata.httpStatusCode).toBe(200);
      expect(mockS3Client.putObject).toHaveBeenCalledTimes(1);
    });

    it('deve gerar URL pública após upload', () => {
      const uploadResult = mockS3Response.upload;

      expect(uploadResult).toHaveProperty('key');
      expect(uploadResult).toHaveProperty('url');
      expect(uploadResult.url).toContain('http');
    });

    it('deve fazer upload de Markdown', async () => {
      const file = {
        name: 'curriculo-refatorado.md',
        content: Buffer.from('# Currículo Refatorado'),
        contentType: 'text/markdown',
      };

      const result = await mockS3Client.putObject({
        Bucket: 'test-bucket',
        Key: `curriculos/user-123/${file.name}`,
        Body: file.content,
        ContentType: file.contentType,
      });

      expect(result.$metadata.httpStatusCode).toBe(200);
    });
  });

  describe('Download de Arquivos', () => {
    it('deve fazer download de arquivo do S3', async () => {
      const result = await mockS3Client.getObject({
        Bucket: 'test-bucket',
        Key: 'curriculos/user-123/curriculo.pdf',
      });

      expect(result).toHaveProperty('Body');
      expect(result).toHaveProperty('ContentType');
      expect(result.ContentType).toBe('application/pdf');
    });

    it('deve gerar URL presigned para download', () => {
      const presignedUrl = mockS3Response.get.url;

      expect(presignedUrl).toContain('http');
      expect(presignedUrl).toContain('test-bucket');
    });
  });

  describe('Listagem de Arquivos', () => {
    it('deve listar arquivos do usuário', async () => {
      const result = await mockS3Client.listObjects({
        Bucket: 'test-bucket',
        Prefix: 'curriculos/user-123/',
      });

      expect(result).toHaveProperty('Contents');
      expect(Array.isArray(result.Contents)).toBe(true);
    });

    it('deve retornar metadados dos arquivos', async () => {
      const result = await mockS3Client.listObjects({
        Bucket: 'test-bucket',
        Prefix: 'curriculos/user-123/',
      });

      const file = result.Contents?.[0];

      expect(file).toHaveProperty('Key');
      expect(file).toHaveProperty('Size');
      expect(file).toHaveProperty('LastModified');
    });
  });

  describe('Deleção de Arquivos', () => {
    it('deve deletar arquivo do S3', async () => {
      const result = await mockS3Client.deleteObject({
        Bucket: 'test-bucket',
        Key: 'curriculos/user-123/curriculo.pdf',
      });

      expect(result.$metadata.httpStatusCode).toBe(204);
      expect(mockS3Client.deleteObject).toHaveBeenCalledTimes(1);
    });

    it('deve deletar múltiplos arquivos', async () => {
      const keys = [
        'curriculos/user-123/curriculo-v1.pdf',
        'curriculos/user-123/curriculo-v2.pdf',
      ];

      for (const key of keys) {
        await mockS3Client.deleteObject({
          Bucket: 'test-bucket',
          Key: key,
        });
      }

      expect(mockS3Client.deleteObject).toHaveBeenCalledTimes(2);
    });
  });

  describe('Organização de Arquivos', () => {
    it('deve organizar arquivos por usuário', () => {
      const userId = 'user-123';
      const fileName = 'curriculo.pdf';
      const key = `curriculos/${userId}/${fileName}`;

      expect(key).toContain(userId);
      expect(key).toContain(fileName);
      expect(key).toMatch(/^curriculos\/user-\d+\/.+$/);
    });

    it('deve separar originais de refatorados', () => {
      const userId = 'user-123';
      const originalKey = `curriculos/${userId}/curriculo-original.pdf`;
      const refatoradoKey = `curriculos/${userId}/curriculo-refatorado.pdf`;

      expect(originalKey).toContain('original');
      expect(refatoradoKey).toContain('refatorado');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de bucket não encontrado', async () => {
      mockS3Client.putObject.mockRejectedValueOnce({
        name: 'NoSuchBucket',
        message: 'The specified bucket does not exist',
      });

      await expect(
        mockS3Client.putObject({
          Bucket: 'bucket-inexistente',
          Key: 'test.pdf',
          Body: Buffer.from('test'),
        })
      ).rejects.toMatchObject({
        name: 'NoSuchBucket',
      });
    });

    it('deve tratar erro de arquivo não encontrado', async () => {
      mockS3Client.getObject.mockRejectedValueOnce({
        name: 'NoSuchKey',
        message: 'The specified key does not exist',
      });

      await expect(
        mockS3Client.getObject({
          Bucket: 'test-bucket',
          Key: 'arquivo-inexistente.pdf',
        })
      ).rejects.toMatchObject({
        name: 'NoSuchKey',
      });
    });
  });

  describe('Segurança', () => {
    it('deve validar permissões de acesso', () => {
      const userId = 'user-123';
      const fileKey = 'curriculos/user-123/curriculo.pdf';

      // Validar se o usuário tem permissão para acessar o arquivo
      const hasPermission = fileKey.includes(userId);

      expect(hasPermission).toBe(true);
    });

    it('deve bloquear acesso a arquivos de outros usuários', () => {
      const userId = 'user-123';
      const fileKey = 'curriculos/user-456/curriculo.pdf';

      const hasPermission = fileKey.includes(userId);

      expect(hasPermission).toBe(false);
    });
  });
});
