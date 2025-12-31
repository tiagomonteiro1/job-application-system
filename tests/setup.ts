/**
 * Vitest Setup File
 * Configurações globais para todos os testes
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { config } from 'dotenv';

// Carregar variáveis de ambiente de teste
config({ path: '.env.test' });

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://test:test@localhost:3306/jobmatch_test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.BUILT_IN_FORGE_API_KEY = 'test_api_key';
process.env.S3_ENDPOINT = 'http://localhost:9000';
process.env.S3_ACCESS_KEY = 'test';
process.env.S3_SECRET_KEY = 'test';
process.env.S3_BUCKET = 'test-bucket';

// Mock global do console para testes mais limpos (opcional)
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Setup antes de todos os testes
beforeAll(async () => {
  // Inicializar banco de dados de teste se necessário
  console.info('🧪 Iniciando suite de testes...');
});

// Cleanup após todos os testes
afterAll(async () => {
  console.info('✅ Suite de testes finalizada');
});

// Limpar mocks antes de cada teste
beforeEach(() => {
  vi.clearAllMocks();
});

// Cleanup após cada teste
afterEach(() => {
  vi.restoreAllMocks();
});
