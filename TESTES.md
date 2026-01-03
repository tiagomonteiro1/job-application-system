# 🧪 Documentação de Testes - JobMatch AI

Este documento descreve a suíte de testes automatizados do sistema JobMatch AI.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Configuração](#configuração)
4. [Executando Testes](#executando-testes)
5. [Cobertura de Testes](#cobertura-de-testes)
6. [CI/CD](#cicd)
7. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

A suíte de testes do JobMatch AI utiliza **Vitest** como framework de testes e cobre:

- ✅ **Testes Unitários** - APIs tRPC, lógica de negócio
- ✅ **Testes de Integração** - Banco de dados, S3, geração de PDF
- ✅ **Mocks** - LLM (OpenAI/Claude), S3 Storage
- ✅ **Coverage** - Relatórios de cobertura de código
- ✅ **CI/CD** - GitHub Actions para execução automática

---

## 📁 Estrutura de Testes

```
tests/
├── setup.ts                    # Configuração global dos testes
├── mocks/                      # Mocks de serviços externos
│   ├── llm.mock.ts            # Mock do cliente LLM
│   └── s3.mock.ts             # Mock do cliente S3
├── unit/                       # Testes unitários
│   ├── curriculo.test.ts      # Testes de upload e análise
│   ├── compatibilidade.test.ts # Testes de compatibilidade
│   └── candidatura.test.ts    # Testes de candidatura
└── integration/                # Testes de integração
    ├── database.test.ts        # Testes de banco de dados
    ├── pdf-generation.test.ts  # Testes de geração de PDF
    └── storage.test.ts         # Testes de storage S3
```

---

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.test.example .env.test
```

Edite `.env.test` com suas configurações de teste:

```env
DATABASE_URL="mysql://test_user:test_password@localhost:3306/jobmatch_test"
JWT_SECRET="test_jwt_secret"
BUILT_IN_FORGE_API_KEY="test_api_key"
```

### 3. Criar Banco de Dados de Teste

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS jobmatch_test;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'test_user'@'localhost' IDENTIFIED BY 'test_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON jobmatch_test.* TO 'test_user'@'localhost';"
```

---

## 🚀 Executando Testes

### Executar Todos os Testes

```bash
pnpm test
```

### Executar em Modo Watch

```bash
pnpm test:watch
```

### Executar com Cobertura

```bash
pnpm test:coverage
```

### Executar com UI Interativa

```bash
pnpm test:ui
```

### Executar Testes Específicos

```bash
# Apenas testes unitários
pnpm test tests/unit

# Apenas testes de integração
pnpm test tests/integration

# Arquivo específico
pnpm test tests/unit/curriculo.test.ts
```

---

## 📊 Cobertura de Testes

### Visualizar Relatório

Após executar `pnpm test:coverage`, abra o relatório HTML:

```bash
open coverage/index.html
```

### Metas de Cobertura

| Métrica | Meta Mínima |
|---------|-------------|
| Lines | 70% |
| Functions | 70% |
| Branches | 70% |
| Statements | 70% |

---

## 🔄 CI/CD

### GitHub Actions

Os testes são executados automaticamente em:

- ✅ Push para `main` ou `develop`
- ✅ Pull Requests

### Workflow

O workflow CI executa:

1. **Lint** - Verificação de formatação de código
2. **TypeScript Check** - Verificação de tipos
3. **Tests** - Execução de todos os testes
4. **Coverage** - Geração de relatório de cobertura
5. **Build** - Build da aplicação
6. **Docker** - Build da imagem Docker (apenas em `main`)

### Ver Resultados

Acesse a aba **Actions** no repositório GitHub para ver os resultados.

---

## 🧪 Tipos de Testes

### Testes Unitários

**Objetivo:** Testar funções e componentes isoladamente.

**Exemplo:**

```typescript
describe('Upload de Currículo', () => {
  it('deve fazer upload de PDF com sucesso', async () => {
    const mockFile = {
      name: 'curriculo.pdf',
      type: 'application/pdf',
      size: 1024 * 100,
    };

    const result = await uploadCurriculo(mockFile);

    expect(result).toHaveProperty('url');
    expect(result.url).toContain('curriculo.pdf');
  });
});
```

### Testes de Integração

**Objetivo:** Testar integração entre componentes e serviços externos.

**Exemplo:**

```typescript
describe('Database Integration', () => {
  it('deve inserir currículo no banco de dados', async () => {
    const curriculo = {
      usuario_id: 'user-123',
      arquivo_url: 'https://s3.example.com/curriculo.pdf',
    };

    const result = await db.insert(curriculos).values(curriculo);

    expect(result).toBeDefined();
  });
});
```

---

## 🎯 Boas Práticas

### 1. Nomenclatura

- Use nomes descritivos para testes
- Siga o padrão: `deve [ação] [resultado esperado]`

```typescript
// ✅ Bom
it('deve rejeitar arquivo maior que 10MB', () => {});

// ❌ Ruim
it('teste de tamanho', () => {});
```

### 2. Arrange-Act-Assert

Organize testes em 3 seções:

```typescript
it('deve calcular score de compatibilidade', () => {
  // Arrange - Preparar dados
  const vaga = { requisitos: ['PHP', 'AWS'] };
  const curriculo = { competencias: ['PHP', 'AWS', 'Docker'] };

  // Act - Executar ação
  const score = calcularCompatibilidade(vaga, curriculo);

  // Assert - Verificar resultado
  expect(score).toBeGreaterThan(80);
});
```

### 3. Mocks

Use mocks para serviços externos:

```typescript
import { mockLLMClient } from '../mocks/llm.mock';

mockLLMClient.chat.completions.create.mockResolvedValueOnce({
  choices: [{ message: { content: 'Resposta mockada' } }],
});
```

### 4. Cleanup

Limpe recursos após cada teste:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### 5. Testes Isolados

Cada teste deve ser independente:

```typescript
// ❌ Ruim - Testes dependentes
let userId;
it('deve criar usuário', () => {
  userId = createUser();
});
it('deve buscar usuário', () => {
  const user = getUser(userId); // Depende do teste anterior
});

// ✅ Bom - Testes independentes
it('deve buscar usuário', () => {
  const userId = createUser();
  const user = getUser(userId);
});
```

---

## 🐛 Debugging

### Modo Debug

```bash
# Node.js Inspector
node --inspect-brk node_modules/.bin/vitest

# VS Code
# Adicione breakpoints e use F5
```

### Logs

```typescript
it('deve processar dados', () => {
  const data = processData();
  console.log('Data:', data); // Logs aparecem no terminal
  expect(data).toBeDefined();
});
```

---

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"

```bash
pnpm install
```

### Erro: "Database connection failed"

Verifique se o MySQL está rodando e as credenciais em `.env.test` estão corretas.

### Erro: "Timeout"

Aumente o timeout nos testes:

```typescript
it('teste demorado', async () => {
  // ...
}, 30000); // 30 segundos
```

---

**Desenvolvido com ❤️ pela equipe JobMatch AI**
