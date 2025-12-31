# 🚀 JobMatch AI

[![CI Status](https://github.com/seu-usuario/job-application-system/workflows/CI%20-%20Tests%20and%20Build/badge.svg)](https://github.com/seu-usuario/job-application-system/actions)
[![Mutation Score](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fseu-usuario%2Fjob-application-system%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/seu-usuario/job-application-system/main)
[![Test Coverage](https://img.shields.io/badge/coverage-70%25-yellow)](https://github.com/seu-usuario/job-application-system)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/seu-usuario/job-application-system/pulls)

**Sistema Inteligente de Candidaturas Automatizadas**

JobMatch AI é uma plataforma completa para gerenciar candidaturas de emprego com inteligência artificial. O sistema analisa seu currículo, refatora profissionalmente, gera cartas de apresentação personalizadas e mantém histórico completo de todas as candidaturas.

---

## ✨ Funcionalidades

- 📄 **Upload e Análise de Currículo** - Upload de PDF com análise inteligente via IA
- 🔄 **Refatoração Profissional** - Melhoria automática do currículo com sugestões da IA
- 📝 **Geração de Carta de Apresentação** - Cartas personalizadas para cada vaga
- 🎯 **Análise de Compatibilidade** - Score detalhado de compatibilidade vaga vs currículo
- 👁️ **Preview em Tempo Real** - Visualização do currículo antes de gerar PDF
- 📊 **Dashboard de Vagas** - 20 vagas reais coletadas e classificadas
- 📜 **Histórico Completo** - Registro de todas as candidaturas com status
- 🎨 **PDF Premium** - Geração de currículo com design profissional

---

## 🚀 Início Rápido

### Opção 1: Setup Automatizado (Recomendado)

**Linux/macOS:**
```bash
./setup.sh
```

**Windows:**
```powershell
.\setup.ps1
```

### Opção 2: Docker (Mais Fácil)

```bash
# 1. Configurar variáveis
cp .env.docker.example .env.docker
# Edite .env.docker e adicione sua API key do OpenAI

# 2. Iniciar serviços
docker-compose --env-file .env.docker up -d

# 3. Executar migrações
docker-compose exec app pnpm db:push

# 4. Acessar aplicação
# http://localhost:3000
```

### Opção 3: Manual

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar .env
cp .env.example .env
# Edite .env com suas configurações

# 3. Configurar banco de dados
mysql -u root -p < docker/mysql/init.sql

# 4. Executar migrações
pnpm db:push

# 5. Iniciar aplicação
pnpm dev
```

---

## 🧬 Qualidade de Código

### Testes Automatizados

O projeto possui uma suíte completa de testes automatizados:

| Tipo de Teste | Cobertura | Threshold |
|---------------|-----------|----------|
| **Unit Tests** | 70%+ | 70% |
| **Integration Tests** | 65%+ | 60% |
| **Mutation Score** | 78%+ | 50% |

### Executar Testes

```bash
# Todos os testes
pnpm test

# Testes com coverage
pnpm test:coverage

# Testes em modo watch
pnpm test:watch

# Mutation testing
pnpm mutation

# Mutation incremental (mais rápido)
pnpm mutation:incremental
```

### Relatórios

- **Test Coverage:** `coverage/index.html`
- **Mutation Report:** `reports/mutation/index.html`

### CI/CD

Todos os testes rodam automaticamente no GitHub Actions em:
- ✅ Push para `main` ou `develop`
- ✅ Pull Requests
- ✅ Mutation testing em PRs (com comentário automático)

---

## 📚 Documentação Completa

Para instruções detalhadas, consulte:

- **[📘 INSTALACAO.md](./INSTALACAO.md)** - Instalação e configuração
- **[🧪 TESTES.md](./TESTES.md)** - Documentação de testes
- **[🧬 MUTATION-TESTING.md](./MUTATION-TESTING.md)** - Mutation testing com Stryker

---

## 🛠️ Tecnologias

### Frontend
- **React 19** - Framework UI
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes
- **tRPC** - Type-safe API client
- **Wouter** - Roteamento

### Backend
- **Node.js 22** - Runtime
- **Express** - Servidor HTTP
- **tRPC** - API type-safe
- **Drizzle ORM** - ORM
- **MySQL 8** - Banco de dados
- **Puppeteer** - Geração de PDF

### Infraestrutura
- **Docker** - Containerização
- **MinIO** - S3-compatible storage
- **OpenAI/Claude** - LLM para análise

---

## 📁 Estrutura do Projeto

```
job-application-system/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── drizzle/         # Schema do banco
├── docker/          # Configurações Docker
├── setup.sh         # Setup Linux/macOS
├── setup.ps1        # Setup Windows
├── Dockerfile       # Build da aplicação
└── docker-compose.yml  # Orquestração
```

---

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|  
| `pnpm dev` | Iniciar em modo desenvolvimento |
| `pnpm build` | Build para produção |
| `pnpm start` | Iniciar em produção |
| `pnpm test` | Executar todos os testes |
| `pnpm test:coverage` | Testes com relatório de cobertura |
| `pnpm mutation` | Executar mutation testing |
| `pnpm db:push` | Sincronizar schema do banco |
| `pnpm check` | Verificar erros TypeScript |

---

## 🐳 Docker

### Serviços Incluídos

- **app** - Aplicação JobMatch AI (porta 3000)
- **mysql** - Banco de dados MySQL 8 (porta 3306)
- **minio** - Storage S3-compatible (portas 9000/9001)

### Comandos Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar serviços
docker-compose down

# Reiniciar aplicação
docker-compose restart app
```

---

## 🔐 Variáveis de Ambiente Obrigatórias

```env
DATABASE_URL="mysql://user:pass@localhost:3306/jobmatch_ai"
JWT_SECRET="sua_chave_jwt_secreta"
BUILT_IN_FORGE_API_KEY="sk-sua-api-key-openai"
S3_ENDPOINT="http://minio:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin123"
```

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/seu-usuario/job-application-system/issues)
- **Email:** suporte@jobmatch.ai
- **Documentação:** [INSTALACAO.md](./INSTALACAO.md)

---

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

---

**Desenvolvido com ❤️ por Manus AI**
