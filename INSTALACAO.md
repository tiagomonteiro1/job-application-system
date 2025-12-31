# 📘 Guia de Instalação - JobMatch AI

**Sistema Inteligente de Candidaturas Automatizadas**

Este documento fornece instruções completas para instalação e configuração do **JobMatch AI** em ambiente localhost para desenvolvimento ou uso pessoal.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação](#instalação)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Executando o Sistema](#executando-o-sistema)
6. [Estrutura do Projeto](#estrutura-do-projeto)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## 🔧 Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter os seguintes softwares instalados em sua máquina:

### Software Necessário

| Software | Versão Mínima | Versão Recomendada | Download |
|----------|---------------|-------------------|----------|
| **Node.js** | 18.x | 22.x | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 8.x | 10.x | `npm install -g pnpm` |
| **MySQL** | 8.0 | 8.0+ | [mysql.com](https://www.mysql.com/) |
| **Git** | 2.x | Latest | [git-scm.com](https://git-scm.com/) |

### Verificando Instalações

Execute os comandos abaixo para verificar se os softwares estão instalados corretamente:

```bash
node --version    # Deve retornar v18.x ou superior
pnpm --version    # Deve retornar 8.x ou superior
mysql --version   # Deve retornar 8.0 ou superior
git --version     # Deve retornar 2.x ou superior
```

---

## 📦 Instalação

### Passo 1: Clonar o Repositório

Clone o repositório do projeto para sua máquina local:

```bash
git clone https://github.com/seu-usuario/job-application-system.git
cd job-application-system
```

### Passo 2: Instalar Dependências

O projeto utiliza **pnpm** como gerenciador de pacotes. Execute o comando abaixo para instalar todas as dependências:

```bash
pnpm install
```

Este processo pode levar alguns minutos dependendo da velocidade da sua conexão com a internet. O pnpm irá instalar todas as dependências listadas no `package.json`, incluindo:

- **React 19** para o frontend
- **tRPC** para comunicação type-safe entre frontend e backend
- **Drizzle ORM** para gerenciamento do banco de dados
- **Tailwind CSS 4** para estilização
- **Puppeteer** para geração de PDFs premium

---

## 🗄️ Configuração do Banco de Dados

### Passo 1: Criar Banco de Dados MySQL

Acesse o MySQL e crie um novo banco de dados para o sistema:

```bash
mysql -u root -p
```

Dentro do console MySQL, execute:

```sql
CREATE DATABASE jobmatch_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jobmatch_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON jobmatch_ai.* TO 'jobmatch_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Importante:** Substitua `sua_senha_segura` por uma senha forte de sua escolha.

### Passo 2: Configurar String de Conexão

A string de conexão do banco de dados será configurada nas variáveis de ambiente (próximo passo). O formato é:

```
mysql://jobmatch_user:sua_senha_segura@localhost:3306/jobmatch_ai
```

### Passo 3: Executar Migrações

Após configurar as variáveis de ambiente (próximo passo), execute o comando para criar as tabelas no banco de dados:

```bash
pnpm db:push
```

Este comando irá criar automaticamente todas as tabelas necessárias:

- `users` - Usuários do sistema
- `curriculos` - Currículos enviados e refatorados
- `candidaturas` - Histórico de candidaturas
- `automacao_config` - Configurações de automação
- `vagas_automaticas` - Vagas coletadas automaticamente
- `automacao_logs` - Logs de execução da automação

---

## 🔐 Variáveis de Ambiente

### Passo 1: Criar Arquivo `.env`

Copie o arquivo de exemplo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### Passo 2: Configurar Variáveis

Abra o arquivo `.env` em um editor de texto e configure as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL="mysql://jobmatch_user:sua_senha_segura@localhost:3306/jobmatch_ai"

# JWT Secret (gere uma chave aleatória segura)
JWT_SECRET="sua_chave_jwt_super_secreta_aqui"

# OAuth (se usar autenticação externa)
OAUTH_SERVER_URL="https://api.manus.im"
OAUTH_CLIENT_ID="seu_client_id"
OAUTH_CLIENT_SECRET="seu_client_secret"

# LLM API (para análise de currículo com IA)
BUILT_IN_FORGE_API_KEY="sua_api_key_llm"
BUILT_IN_FORGE_API_URL="https://api.openai.com/v1"

# S3 Storage (para armazenamento de PDFs)
S3_ENDPOINT="seu_endpoint_s3"
S3_ACCESS_KEY="sua_access_key"
S3_SECRET_KEY="sua_secret_key"
S3_BUCKET="jobmatch-curriculos"
S3_REGION="us-east-1"

# Frontend
VITE_APP_TITLE="JobMatch AI"
VITE_APP_LOGO="/logo.png"
VITE_FRONTEND_FORGE_API_KEY="sua_api_key_frontend"

# Servidor
PORT=3000
NODE_ENV=development
```

### Tabela de Variáveis Obrigatórias

| Variável | Descrição | Obrigatória | Exemplo |
|----------|-----------|-------------|---------|
| `DATABASE_URL` | String de conexão MySQL | ✅ Sim | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Chave para tokens JWT | ✅ Sim | `minha_chave_super_secreta_123` |
| `BUILT_IN_FORGE_API_KEY` | API Key do LLM (OpenAI/Claude) | ✅ Sim | `sk-...` |
| `S3_ENDPOINT` | Endpoint do S3 | ✅ Sim | `https://s3.amazonaws.com` |
| `S3_ACCESS_KEY` | Access Key do S3 | ✅ Sim | `AKIAIOSFODNN7EXAMPLE` |
| `S3_SECRET_KEY` | Secret Key do S3 | ✅ Sim | `wJalrXUtnFEMI/K7MDENG/...` |
| `S3_BUCKET` | Nome do bucket S3 | ✅ Sim | `jobmatch-curriculos` |
| `PORT` | Porta do servidor | ❌ Não | `3000` (padrão) |

### Gerando JWT Secret

Para gerar uma chave JWT segura, execute:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚀 Executando o Sistema

### Modo Desenvolvimento

Para executar o sistema em modo de desenvolvimento com hot-reload:

```bash
pnpm dev
```

O sistema estará disponível em:

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)

### Modo Produção

Para executar o sistema em modo produção:

```bash
# 1. Build do projeto
pnpm build

# 2. Iniciar servidor
pnpm start
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Compila projeto para produção |
| `pnpm start` | Inicia servidor em produção |
| `pnpm db:push` | Sincroniza schema com banco de dados |
| `pnpm db:studio` | Abre interface visual do banco (Drizzle Studio) |
| `pnpm check` | Verifica erros TypeScript |
| `pnpm format` | Formata código com Prettier |

---

## 📁 Estrutura do Projeto

```
job-application-system/
├── client/                    # Frontend React
│   ├── public/               # Arquivos estáticos
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── ui/          # Componentes shadcn/ui
│   │   │   ├── JobCard.tsx  # Card de vaga
│   │   │   ├── CurriculoPreview.tsx  # Preview do currículo
│   │   │   └── ...
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── Home.tsx     # Dashboard de vagas
│   │   │   ├── Curriculo.tsx  # Gerenciamento de currículo
│   │   │   └── Historico.tsx  # Histórico de candidaturas
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilitários
│   │   ├── App.tsx          # Rotas principais
│   │   └── index.css        # Estilos globais
│   └── index.html
│
├── server/                   # Backend Node.js
│   ├── _core/               # Core do servidor
│   │   ├── trpc.ts         # Configuração tRPC
│   │   ├── llm.ts          # Cliente LLM
│   │   └── index.ts        # Entry point
│   ├── routers/            # tRPC routers
│   │   ├── curriculo.ts    # APIs de currículo
│   │   ├── candidatura.ts  # APIs de candidatura
│   │   └── compatibilidade.ts  # APIs de análise
│   ├── templates/          # Templates HTML
│   │   └── curriculo-premium.html  # Template PDF
│   ├── utils/              # Utilitários
│   │   ├── pdf-generator.ts      # Geração de PDF
│   │   └── preview-generator.ts  # Geração de preview
│   ├── db.ts               # Funções de banco de dados
│   ├── storage.ts          # Cliente S3
│   └── routers.ts          # Registro de routers
│
├── drizzle/                 # Configuração do banco
│   └── schema.ts           # Schema do banco de dados
│
├── shared/                  # Código compartilhado
│   └── const.ts            # Constantes
│
├── package.json            # Dependências
├── tsconfig.json           # Configuração TypeScript
├── tailwind.config.ts      # Configuração Tailwind
├── vite.config.ts          # Configuração Vite
└── .env                    # Variáveis de ambiente
```

---

## 🔧 Troubleshooting

### Problema: Erro ao conectar no banco de dados

**Sintoma:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solução:**

1. Verifique se o MySQL está rodando:
   ```bash
   sudo systemctl status mysql  # Linux
   brew services list           # macOS
   ```

2. Verifique se a string de conexão no `.env` está correta

3. Teste a conexão manualmente:
   ```bash
   mysql -u jobmatch_user -p -h localhost jobmatch_ai
   ```

### Problema: Erro "JWT_SECRET is not defined"

**Sintoma:** Aplicação não inicia ou erro de autenticação

**Solução:**

1. Verifique se o arquivo `.env` existe na raiz do projeto

2. Certifique-se de que `JWT_SECRET` está definido no `.env`

3. Reinicie o servidor após adicionar a variável

### Problema: Erro ao gerar PDF premium

**Sintoma:** `Error: Failed to launch the browser process`

**Solução:**

O Puppeteer requer dependências adicionais no Linux:

```bash
# Ubuntu/Debian
sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2

# Fedora/CentOS
sudo yum install -y \
  nss atk at-spi2-atk cups-libs libdrm \
  libXcomposite libXdamage libXrandr mesa-libgbm alsa-lib
```

### Problema: Erro "S3 bucket not found"

**Sintoma:** Upload de currículo falha

**Solução:**

1. Verifique se as credenciais S3 no `.env` estão corretas

2. Certifique-se de que o bucket existe e você tem permissões

3. Teste as credenciais com AWS CLI:
   ```bash
   aws s3 ls s3://jobmatch-curriculos --profile seu_perfil
   ```

### Problema: Porta 3000 já está em uso

**Sintoma:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solução:**

1. Altere a porta no `.env`:
   ```env
   PORT=3001
   ```

2. Ou mate o processo que está usando a porta:
   ```bash
   # Linux/macOS
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

---

## 🐳 Instalação com Docker

### Pré-requisitos Docker

Certifique-se de ter instalado:

- **Docker** 20.10+ ([docker.com](https://www.docker.com/))
- **Docker Compose** 2.0+ (geralmente incluído no Docker Desktop)

### Passo 1: Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.docker.example .env.docker
```

Edite `.env.docker` e configure **obrigatoriamente**:

```env
BUILT_IN_FORGE_API_KEY=sk-sua-api-key-openai
VITE_FRONTEND_FORGE_API_KEY=sk-sua-api-key-openai
```

### Passo 2: Iniciar Serviços

Execute o comando abaixo para iniciar todos os serviços (MySQL + MinIO + App):

```bash
docker-compose --env-file .env.docker up -d
```

Este comando irá:

1. Baixar as imagens Docker necessárias
2. Criar e iniciar o container MySQL
3. Criar e iniciar o container MinIO (S3 local)
4. Criar bucket S3 automaticamente
5. Fazer build e iniciar a aplicação

### Passo 3: Executar Migrações

Após os containers estarem rodando, execute as migrações do banco:

```bash
docker-compose exec app pnpm db:push
```

### Passo 4: Acessar Aplicação

A aplicação estará disponível em:

- **JobMatch AI:** [http://localhost:3000](http://localhost:3000)
- **MinIO Console:** [http://localhost:9001](http://localhost:9001)
  - Usuário: `minioadmin`
  - Senha: `minioadmin123`

### Comandos Úteis Docker

| Comando | Descrição |
|---------|-------------|
| `docker-compose up -d` | Iniciar serviços em background |
| `docker-compose down` | Parar e remover containers |
| `docker-compose logs -f app` | Ver logs da aplicação |
| `docker-compose restart app` | Reiniciar aplicação |
| `docker-compose exec app sh` | Acessar shell do container |
| `docker-compose ps` | Ver status dos containers |

### Backup com Docker

**Backup do banco de dados:**

```bash
docker-compose exec mysql mysqldump -u jobmatch_user -p jobmatch_ai > backup.sql
```

**Restaurar backup:**

```bash
docker-compose exec -T mysql mysql -u jobmatch_user -p jobmatch_ai < backup.sql
```

---

## ⛓ FAQ

### Como adiciono mais vagas manualmente?

As vagas estão armazenadas em `/client/public/curriculo.json`. Você pode editar este arquivo para adicionar novas vagas seguindo a estrutura existente.

### Posso usar outro banco de dados além do MySQL?

Sim, o Drizzle ORM suporta PostgreSQL e SQLite. Você precisará ajustar a string de conexão no `.env` e instalar o driver correspondente.

### Como configuro autenticação com Google/GitHub?

O sistema usa OAuth2. Configure as variáveis `OAUTH_CLIENT_ID` e `OAUTH_CLIENT_SECRET` no `.env` com as credenciais do provedor escolhido.

### Posso usar outro provedor de LLM além do OpenAI?

Sim, o sistema é compatível com qualquer API que siga o padrão OpenAI (Claude, Gemini, LLaMA via Ollama). Ajuste `BUILT_IN_FORGE_API_URL` para o endpoint desejado.

### Como faço backup do banco de dados?

```bash
mysqldump -u jobmatch_user -p jobmatch_ai > backup_$(date +%Y%m%d).sql
```

### O sistema funciona offline?

Não completamente. A análise de currículo e geração de cartas requerem conexão com a API do LLM. O armazenamento de PDFs requer S3. Você pode configurar alternativas locais (Ollama para LLM, MinIO para S3).

---

## 📞 Suporte

Para problemas não listados neste guia:

- **Issues:** [GitHub Issues](https://github.com/seu-usuario/job-application-system/issues)
- **Email:** suporte@jobmatch.ai
- **Documentação:** [docs.jobmatch.ai](https://docs.jobmatch.ai)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Consulte o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ por Manus AI**

*Última atualização: 30 de Dezembro de 2024*
