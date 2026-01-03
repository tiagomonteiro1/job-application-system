/**
 * Mock do cliente S3 para testes
 */

import { vi } from 'vitest';

export const mockS3Response = {
  upload: {
    key: 'curriculos/test-user-123/curriculo-original.pdf',
    url: 'http://localhost:9000/test-bucket/curriculos/test-user-123/curriculo-original.pdf',
  },
  get: {
    key: 'curriculos/test-user-123/curriculo-original.pdf',
    url: 'http://localhost:9000/test-bucket/curriculos/test-user-123/curriculo-original.pdf',
  },
};

export const mockS3Client = {
  putObject: vi.fn().mockResolvedValue({
    $metadata: {
      httpStatusCode: 200,
    },
  }),
  getObject: vi.fn().mockResolvedValue({
    Body: Buffer.from('Mock PDF content'),
    ContentType: 'application/pdf',
  }),
  deleteObject: vi.fn().mockResolvedValue({
    $metadata: {
      httpStatusCode: 204,
    },
  }),
  listObjects: vi.fn().mockResolvedValue({
    Contents: [
      {
        Key: 'curriculos/test-user-123/curriculo-original.pdf',
        Size: 1024,
        LastModified: new Date(),
      },
    ],
  }),
};

export const createMockS3Response = (customResponse?: Partial<typeof mockS3Response>) => {
  return {
    ...mockS3Response,
    ...customResponse,
  };
};
