# 🔌 Guia de Integração de APIs - JobMatch AI

## 📋 Visão Geral

Este guia explica como configurar e usar as integrações de APIs implementadas no JobMatch AI:

1. **APIs de Vagas** - LinkedIn, Indeed, Gupy, Adzuna
2. **OpenAI GPT-4** - Análise e refatoração de currículos
3. **WhatsApp Business** - Notificações automáticas

---

## 🎯 APIs de Vagas

### Fontes Suportadas

| Fonte | Tipo | Custo | Vagas/mês |
|-------|------|-------|-----------|
| **LinkedIn** | RapidAPI | Pago | Ilimitado |
| **Indeed** | RapidAPI | Pago | Ilimitado |
| **Adzuna** | API Direta | Grátis | 5.000 |
| **Gupy** | Web Scraping | Grátis | Ilimitado |

### Configuração

#### 1. RapidAPI (LinkedIn + Indeed)

1. Criar conta em https://rapidapi.com/
2. Assinar APIs:
   - [LinkedIn Data API](https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api)
   - [Indeed12 API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/indeed12)
3. Copiar API Key
4. Adicionar ao `.env`:

```bash
RAPIDAPI_KEY=sua_chave_aqui
```

**Custo estimado:** $9.99/mês (plano básico)

#### 2. Adzuna API (Gratuita)

1. Criar conta em https://developer.adzuna.com/
2. Criar aplicação
3. Copiar App ID e App Key
4. Adicionar ao `.env`:

```bash
ADZUNA_APP_ID=seu_app_id
ADZUNA_APP_KEY=sua_app_key
```

**Limite gratuito:** 5.000 requisições/mês

#### 3. Gupy (Sem configuração)

A integração com Gupy usa web scraping da API pública.
Não requer configuração adicional.

### Uso via tRPC

```typescript
// Buscar em todas as fontes
const result = await trpc.jobsApi.searchAllSources.mutate({
  keywords: 'desenvolvedor react',
  location: 'São Paulo',
  limit: 100
});

// Buscar em fonte específica
const linkedInJobs = await trpc.jobsApi.searchBySource.mutate({
  source: 'linkedin',
  keywords: 'frontend developer',
  location: 'Remote',
  limit: 50
});

// Testar conexão
const status = await trpc.jobsApi.testConnection.query();
console.log(status.apis); // Status de cada API
```

### Estrutura de Resposta

```typescript
interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  type: string; // CLT, PJ, Remoto, etc.
  url: string;
  source: 'linkedin' | 'indeed' | 'gupy' | 'other';
  postedDate: Date;
  requirements?: string[];
  benefits?: string[];
}
```

---

## 🤖 OpenAI GPT-4

### Funcionalidades

1. **Análise de Currículo** - Pontuação e sugestões
2. **Refatoração** - Melhoria automática
3. **Compatibilidade** - Match vaga vs currículo
4. **Carta de Apresentação** - Geração automática
5. **Extração de Dados** - Parser inteligente
6. **Sugestões LinkedIn** - Otimização de perfil

### Configuração

1. Criar conta em https://platform.openai.com/
2. Gerar API Key em https://platform.openai.com/api-keys
3. Adicionar créditos (mínimo $5)
4. Adicionar ao `.env`:

```bash
OPENAI_API_KEY=sk-...
```

**Custo estimado:**
- GPT-4 Turbo: $0.01 por 1K tokens de entrada
- Análise de currículo: ~$0.05 por análise
- Uso mensal estimado: $10-30

### Uso via tRPC

```typescript
// Analisar currículo
const analysis = await trpc.openai.analyzeResume.mutate({
  resumeText: curriculoTexto
});

console.log(analysis.analysis.score); // 0-100
console.log(analysis.analysis.strengths); // Pontos fortes
console.log(analysis.analysis.suggestions); // Sugestões

// Refatorar currículo
const refactored = await trpc.openai.refactorResume.mutate({
  resumeText: curriculoTexto,
  targetRole: 'Desenvolvedor Full Stack'
});

console.log(refactored.refactoring.improvedResume); // Currículo melhorado

// Calcular compatibilidade
const compatibility = await trpc.openai.calculateCompatibility.mutate({
  resumeText: curriculoTexto,
  jobDescription: descricaoVaga
});

console.log(compatibility.compatibility.score); // 0-100
console.log(compatibility.compatibility.matchingSkills); // Skills que batem
console.log(compatibility.compatibility.missingSkills); // Skills faltando

// Gerar carta de apresentação
const coverLetter = await trpc.openai.generateCoverLetter.mutate({
  resumeText: curriculoTexto,
  jobDescription: descricaoVaga,
  companyName: 'Empresa XYZ'
});

console.log(coverLetter.coverLetter); // Carta personalizada
```

### Estrutura de Resposta

```typescript
interface ResumeAnalysis {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
  experienceLevel: 'junior' | 'pleno' | 'senior' | 'especialista';
  topSkills: string[];
}

interface JobCompatibility {
  score: number; // 0-100
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  coverLetterSuggestion: string;
}
```

---

## 📱 WhatsApp Business API

### Opções de Integração

#### Opção 1: Twilio (Recomendado)

**Vantagens:**
- Fácil de configurar
- Documentação excelente
- Suporte 24/7
- Sandbox para testes

**Configuração:**

1. Criar conta em https://www.twilio.com/
2. Ativar WhatsApp no console
3. Configurar número WhatsApp
4. Adicionar ao `.env`:

```bash
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Custo:**
- Mensagens: $0.005 por mensagem
- Uso mensal estimado: $5-20

#### Opção 2: Meta WhatsApp Business API

**Vantagens:**
- API oficial do WhatsApp
- Mais recursos
- Melhor integração

**Configuração:**

1. Criar conta Meta Business em https://business.facebook.com/
2. Configurar WhatsApp Business API
3. Obter Access Token
4. Adicionar ao `.env`:

```bash
WHATSAPP_PROVIDER=meta
META_WHATSAPP_TOKEN=...
META_PHONE_NUMBER_ID=...
```

**Custo:**
- Primeiras 1.000 mensagens/mês: Grátis
- Após isso: $0.005 por mensagem

### Uso via tRPC

```typescript
// Notificar nova vaga
await trpc.whatsapp.notifyNewJob.mutate({
  phoneNumber: '+5511999999999',
  jobTitle: 'Desenvolvedor React',
  company: 'Empresa XYZ',
  url: 'https://...'
});

// Notificar candidatura enviada
await trpc.whatsapp.notifyApplicationSent.mutate({
  phoneNumber: '+5511999999999',
  jobTitle: 'Desenvolvedor React',
  company: 'Empresa XYZ'
});

// Enviar lembrete de follow-up
await trpc.whatsapp.sendFollowUpReminder.mutate({
  phoneNumber: '+5511999999999',
  jobTitle: 'Desenvolvedor React',
  company: 'Empresa XYZ',
  daysAgo: 7
});

// Enviar resumo diário
await trpc.whatsapp.sendDailySummary.mutate({
  phoneNumber: '+5511999999999',
  newJobs: 15,
  applicationsSent: 3,
  pendingFollowUps: 5
});
```

---

## 🔧 Configuração Completa

### Arquivo `.env`

```bash
# APIs de Vagas
RAPIDAPI_KEY=sua_chave_rapidapi
ADZUNA_APP_ID=seu_app_id_adzuna
ADZUNA_APP_KEY=sua_app_key_adzuna

# OpenAI GPT-4
OPENAI_API_KEY=sk-...

# WhatsApp (escolha um)
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# OU

WHATSAPP_PROVIDER=meta
META_WHATSAPP_TOKEN=...
META_PHONE_NUMBER_ID=...
```

---

## 💰 Resumo de Custos

### Configuração Mínima (Grátis)
- ✅ Adzuna API (5.000 vagas/mês)
- ✅ Gupy (ilimitado)
- ❌ Sem OpenAI
- ❌ Sem WhatsApp

**Custo:** R$ 0/mês

### Configuração Básica
- ✅ Adzuna API
- ✅ Gupy
- ✅ OpenAI GPT-4 ($10/mês)
- ✅ Twilio WhatsApp ($5/mês)

**Custo:** ~R$ 75/mês

### Configuração Completa
- ✅ RapidAPI ($10/mês)
- ✅ Adzuna API
- ✅ Gupy
- ✅ OpenAI GPT-4 ($30/mês)
- ✅ Twilio WhatsApp ($20/mês)

**Custo:** ~R$ 300/mês

---

## 🧪 Testando as Integrações

### 1. Testar APIs de Vagas

```bash
# Via tRPC
curl -X POST http://localhost:3000/api/trpc/jobsApi.testConnection
```

### 2. Testar OpenAI

```typescript
const result = await trpc.openai.analyzeResume.mutate({
  resumeText: 'Desenvolvedor com 5 anos de experiência...'
});
```

### 3. Testar WhatsApp

```typescript
const result = await trpc.whatsapp.notifyNewJob.mutate({
  phoneNumber: '+5511999999999',
  jobTitle: 'Teste',
  company: 'Teste',
  url: 'https://teste.com'
});
```

---

## 📊 Monitoramento

### Logs

Todos os serviços geram logs detalhados:

```bash
# Ver logs do servidor
tail -f logs/server.log

# Ver logs de APIs
tail -f logs/apis.log
```

### Métricas

- Requisições por API
- Taxa de sucesso/erro
- Tempo de resposta
- Custo por operação

---

## 🆘 Troubleshooting

### APIs de Vagas não funcionam

1. Verificar chaves de API no `.env`
2. Verificar limites de uso
3. Testar conexão: `trpc.jobsApi.testConnection`

### OpenAI retorna erro

1. Verificar saldo de créditos
2. Verificar API Key válida
3. Verificar limites de rate limit

### WhatsApp não envia

1. Verificar número no formato internacional
2. Verificar credenciais Twilio/Meta
3. Verificar templates aprovados (Meta)

---

## 📚 Recursos Adicionais

- [RapidAPI Docs](https://docs.rapidapi.com/)
- [Adzuna API Docs](https://developer.adzuna.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Meta WhatsApp Docs](https://developers.facebook.com/docs/whatsapp)

---

**Integração completa implementada!** 🎉
