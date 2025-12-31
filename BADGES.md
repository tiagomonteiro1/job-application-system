# 🏷️ Configuração de Badges

Este documento explica como configurar os badges do README.md para seu repositório.

---

## 📋 Badges Incluídos

### 1. CI Status Badge

**Badge:**
```markdown
[![CI Status](https://github.com/seu-usuario/job-application-system/workflows/CI%20-%20Tests%20and%20Build/badge.svg)](https://github.com/seu-usuario/job-application-system/actions)
```

**Como configurar:**
1. Substitua `seu-usuario` pelo seu usuário do GitHub
2. O badge será atualizado automaticamente quando o GitHub Actions rodar

---

### 2. Mutation Score Badge (Stryker)

**Badge:**
```markdown
[![Mutation Score](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fseu-usuario%2Fjob-application-system%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/seu-usuario/job-application-system/main)
```

**Como configurar:**

1. Substitua `seu-usuario` pelo seu usuário do GitHub

2. Configure o Stryker Dashboard:
   ```bash
   # Instalar Stryker Dashboard Reporter
   pnpm add -D @stryker-mutator/dashboard-reporter
   ```

3. Adicione token do Stryker Dashboard nas variáveis de ambiente do GitHub:
   - Vá em: **Settings** → **Secrets and variables** → **Actions**
   - Adicione: `STRYKER_DASHBOARD_API_KEY`
   - Obtenha a key em: https://dashboard.stryker-mutator.io/

4. Atualize `.github/workflows/ci.yml` para enviar relatório:
   ```yaml
   - name: Run mutation testing
     run: pnpm mutation
     env:
       STRYKER_DASHBOARD_API_KEY: ${{ secrets.STRYKER_DASHBOARD_API_KEY }}
   ```

5. Após o primeiro push, o badge será atualizado automaticamente

---

### 3. Test Coverage Badge

**Badge Atual (Estático):**
```markdown
[![Test Coverage](https://img.shields.io/badge/coverage-70%25-yellow)](https://github.com/seu-usuario/job-application-system)
```

**Opção 1: Codecov (Recomendado)**

1. Crie conta em: https://codecov.io/
2. Conecte seu repositório GitHub
3. Adicione token nas secrets do GitHub: `CODECOV_TOKEN`
4. O badge será:
   ```markdown
   [![codecov](https://codecov.io/gh/seu-usuario/job-application-system/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/job-application-system)
   ```

**Opção 2: Coveralls**

1. Crie conta em: https://coveralls.io/
2. Conecte seu repositório
3. Badge:
   ```markdown
   [![Coverage Status](https://coveralls.io/repos/github/seu-usuario/job-application-system/badge.svg?branch=main)](https://coveralls.io/github/seu-usuario/job-application-system?branch=main)
   ```

---

### 4. Node.js Version Badge

**Badge:**
```markdown
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)
```

**Como atualizar:**
- Substitua `22.0.0` pela versão mínima do Node.js requerida
- Cores disponíveis: `brightgreen`, `green`, `yellowgreen`, `yellow`, `orange`, `red`

---

### 5. License Badge

**Badge:**
```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
```

**Outras licenças:**
- Apache 2.0: `License-Apache%202.0-blue`
- GPL v3: `License-GPLv3-blue`
- BSD 3-Clause: `License-BSD%203--Clause-blue`

---

### 6. TypeScript Badge

**Badge:**
```markdown
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
```

**Como atualizar:**
- Substitua `5.6` pela versão do TypeScript em `package.json`

---

### 7. PRs Welcome Badge

**Badge:**
```markdown
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/seu-usuario/job-application-system/pulls)
```

**Como configurar:**
- Substitua `seu-usuario` pelo seu usuário do GitHub

---

## 🎨 Badges Adicionais Sugeridos

### Build Size

```markdown
[![Bundle Size](https://img.shields.io/bundlephobia/min/job-application-system)](https://bundlephobia.com/package/job-application-system)
```

### Dependencies Status

```markdown
[![Dependencies](https://img.shields.io/librariesio/github/seu-usuario/job-application-system)](https://libraries.io/github/seu-usuario/job-application-system)
```

### Last Commit

```markdown
[![Last Commit](https://img.shields.io/github/last-commit/seu-usuario/job-application-system)](https://github.com/seu-usuario/job-application-system/commits/main)
```

### Stars

```markdown
[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/job-application-system?style=social)](https://github.com/seu-usuario/job-application-system/stargazers)
```

### Issues

```markdown
[![GitHub issues](https://img.shields.io/github/issues/seu-usuario/job-application-system)](https://github.com/seu-usuario/job-application-system/issues)
```

### Contributors

```markdown
[![Contributors](https://img.shields.io/github/contributors/seu-usuario/job-application-system)](https://github.com/seu-usuario/job-application-system/graphs/contributors)
```

---

## 🔧 Ferramentas para Criar Badges

### Shields.io

https://shields.io/

Crie badges personalizados com:
- Texto customizado
- Cores específicas
- Ícones
- Links

**Exemplo:**
```markdown
[![Custom Badge](https://img.shields.io/badge/JobMatch-AI-blue?logo=react)](https://github.com/seu-usuario/job-application-system)
```

### Badgen

https://badgen.net/

Alternativa mais leve ao Shields.io.

---

## 📊 Exemplo Completo

```markdown
# 🚀 JobMatch AI

[![CI Status](https://github.com/seu-usuario/job-application-system/workflows/CI%20-%20Tests%20and%20Build/badge.svg)](https://github.com/seu-usuario/job-application-system/actions)
[![Mutation Score](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fseu-usuario%2Fjob-application-system%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/seu-usuario/job-application-system/main)
[![codecov](https://codecov.io/gh/seu-usuario/job-application-system/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/job-application-system)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/seu-usuario/job-application-system/pulls)
[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/job-application-system?style=social)](https://github.com/seu-usuario/job-application-system/stargazers)
```

---

## ✅ Checklist de Configuração

- [ ] Substituir `seu-usuario` em todos os badges
- [ ] Configurar Stryker Dashboard API Key
- [ ] Configurar Codecov ou Coveralls (opcional)
- [ ] Atualizar versões (Node.js, TypeScript)
- [ ] Testar todos os links dos badges
- [ ] Fazer primeiro push para ativar badges

---

**Desenvolvido com ❤️ pela equipe JobMatch AI**
