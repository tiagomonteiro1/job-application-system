# 🧬 Mutation Testing - JobMatch AI

Este documento explica o **Mutation Testing** implementado no projeto usando **Stryker Mutator**.

---

## 📋 Índice

1. [O que é Mutation Testing?](#o-que-é-mutation-testing)
2. [Por que usar Mutation Testing?](#por-que-usar-mutation-testing)
3. [Como funciona?](#como-funciona)
4. [Executando Mutation Testing](#executando-mutation-testing)
5. [Interpretando Resultados](#interpretando-resultados)
6. [Thresholds e Qualidade](#thresholds-e-qualidade)
7. [Tipos de Mutações](#tipos-de-mutações)
8. [Melhorando o Mutation Score](#melhorando-o-mutation-score)
9. [CI/CD Integration](#cicd-integration)

---

## 🎯 O que é Mutation Testing?

**Mutation Testing** é uma técnica avançada de teste de software que avalia a **qualidade dos seus testes** introduzindo pequenas alterações (mutações) no código e verificando se os testes conseguem detectá-las.

### Exemplo Simples

**Código Original:**
```typescript
function somar(a: number, b: number): number {
  return a + b;
}
```

**Mutação (troca + por -):**
```typescript
function somar(a: number, b: number): number {
  return a - b;  // Mutação: + → -
}
```

Se seus testes **não detectarem** essa mudança, significa que eles não são suficientemente robustos!

---

## 💡 Por que usar Mutation Testing?

### Problemas que Mutation Testing resolve:

1. **Testes fracos** - Alta cobertura de código não garante qualidade
2. **Falsa sensação de segurança** - 100% de coverage pode ter testes inúteis
3. **Bugs não detectados** - Testes que passam mas não validam comportamento

### Benefícios:

✅ **Valida a qualidade dos testes**, não apenas a quantidade  
✅ **Identifica testes fracos** que não detectam bugs reais  
✅ **Melhora a confiança** no código em produção  
✅ **Encontra edge cases** não cobertos  

---

## ⚙️ Como funciona?

### Processo do Stryker:

1. **Análise** - Stryker analisa o código fonte
2. **Mutação** - Cria versões mutadas do código
3. **Execução** - Roda os testes contra cada mutação
4. **Avaliação** - Classifica cada mutante:
   - **Killed** ✅ - Teste detectou a mutação (bom!)
   - **Survived** ❌ - Teste não detectou (ruim!)
   - **Timeout** ⏱️ - Teste demorou demais
   - **No Coverage** 🚫 - Código sem cobertura

5. **Relatório** - Gera mutation score

### Fórmula do Mutation Score:

```
Mutation Score = (Killed / (Killed + Survived + Timeout)) × 100%
```

---

## 🚀 Executando Mutation Testing

### 1. Executar Mutation Testing Completo

```bash
pnpm mutation
```

**Tempo estimado:** 10-30 minutos (depende do tamanho do projeto)

### 2. Executar em Modo Incremental

```bash
pnpm mutation:incremental
```

Roda apenas nos arquivos modificados desde a última execução (muito mais rápido!).

### 3. Visualizar Relatório

```bash
pnpm mutation:report
```

Abre o relatório HTML interativo no navegador.

### 4. Executar em Arquivos Específicos

```bash
npx stryker run --mutate "server/routers/curriculo.ts"
```

---

## 📊 Interpretando Resultados

### Exemplo de Saída:

```
Mutation testing complete!

Mutation score: 78.5%
  Killed: 157
  Survived: 43
  Timeout: 2
  No Coverage: 8
  Total: 210
```

### O que significa cada métrica:

| Métrica | Significado | Ideal |
|---------|-------------|-------|
| **Killed** | Testes detectaram a mutação | Alto |
| **Survived** | Testes NÃO detectaram | Baixo |
| **Timeout** | Teste demorou muito | Baixo |
| **No Coverage** | Código sem testes | Zero |

### Relatório HTML Interativo:

O relatório HTML mostra:

- 📈 **Mutation Score** por arquivo
- 🔍 **Mutações sobreviventes** (clique para ver detalhes)
- 📝 **Código original vs mutado** lado a lado
- 🎯 **Sugestões** de melhoria

---

## 🎯 Thresholds e Qualidade

### Thresholds Configurados:

| Threshold | Score | Significado |
|-----------|-------|-------------|
| **High** | ≥ 80% | Excelente qualidade de testes |
| **Low** | < 60% | Precisa melhorar |
| **Break** | < 50% | **Falha no CI** ❌ |

### Classificação de Qualidade:

- **90-100%** 🏆 - Excepcional
- **80-89%** ✅ - Excelente
- **70-79%** 👍 - Bom
- **60-69%** ⚠️ - Aceitável
- **< 60%** ❌ - Insuficiente

---

## 🧬 Tipos de Mutações

### 1. Arithmetic Operator (Operadores Aritméticos)

```typescript
// Original
const total = a + b;

// Mutações
const total = a - b;  // + → -
const total = a * b;  // + → *
const total = a / b;  // + → /
```

### 2. Conditional Expression (Expressões Condicionais)

```typescript
// Original
if (score > 80) { ... }

// Mutações
if (score >= 80) { ... }  // > → >=
if (score < 80) { ... }   // > → <
if (true) { ... }         // Remove condição
```

### 3. Logical Operator (Operadores Lógicos)

```typescript
// Original
if (isValid && isActive) { ... }

// Mutações
if (isValid || isActive) { ... }  // && → ||
if (isValid) { ... }              // Remove segundo operando
```

### 4. Boolean Literal (Literais Booleanos)

```typescript
// Original
const isEnabled = true;

// Mutação
const isEnabled = false;  // true → false
```

### 5. String Literal (Literais de String)

```typescript
// Original
const message = "Success";

// Mutação
const message = "";  // Remove string
```

### 6. Unary Operator (Operadores Unários)

```typescript
// Original
const negative = -value;

// Mutação
const negative = +value;  // - → +
```

### 7. Update Operator (Operadores de Incremento)

```typescript
// Original
counter++;

// Mutações
counter--;  // ++ → --
```

---

## 📈 Melhorando o Mutation Score

### 1. Identificar Mutantes Sobreviventes

Abra o relatório HTML e procure por mutantes **Survived**:

```bash
pnpm mutation:report
```

### 2. Analisar o Código Mutado

Clique no mutante sobrevivente para ver:
- Código original
- Código mutado
- Por que o teste não detectou

### 3. Adicionar Testes Específicos

**Exemplo:** Mutante sobrevivente em validação

```typescript
// Código com mutante sobrevivente
function validarIdade(idade: number): boolean {
  return idade >= 18;  // Mutação: >= → >
}

// Teste fraco (não detecta mutação)
it('deve validar idade', () => {
  expect(validarIdade(20)).toBe(true);
});

// ✅ Teste melhorado (detecta mutação)
it('deve validar idade maior ou igual a 18', () => {
  expect(validarIdade(18)).toBe(true);   // Edge case!
  expect(validarIdade(17)).toBe(false);  // Edge case!
  expect(validarIdade(20)).toBe(true);
});
```

### 4. Testar Edge Cases

Mutantes geralmente sobrevivem em:
- **Condições de borda** (>=, <=, ==)
- **Operadores lógicos** (&&, ||)
- **Valores default**

### 5. Remover Código Morto

Se um mutante tem **No Coverage**, considere:
- Adicionar testes
- Remover código não utilizado

---

## 🔄 CI/CD Integration

### GitHub Actions

Mutation Testing roda automaticamente em:

- ✅ Pull Requests
- ✅ Push para `main`

### Workflow

1. **Testes normais** rodam primeiro
2. **Mutation testing** roda se testes passarem
3. **Relatório** é gerado e anexado ao PR
4. **Comentário automático** no PR com mutation score

### Exemplo de Comentário no PR:

```markdown
## 🧬 Mutation Testing Results

**Mutation Score:** 78.5%

- Total Mutants: 210
- Killed: 157
- Survived: 43
- Timeout: 2
- No Coverage: 8

[View Full Report](https://github.com/...)
```

### Falha no CI

Se mutation score < 50%, o CI **falha** ❌

---

## 🛠️ Configuração Avançada

### Excluir Mutações Específicas

Edite `.stryker.conf.mjs`:

```javascript
mutator: {
  excludedMutations: [
    'StringLiteral',    // Ignora mutações em strings
    'BlockStatement',   // Ignora remoção de blocos
  ],
}
```

### Ajustar Thresholds

```javascript
thresholds: {
  high: 85,    // Aumenta para 85%
  low: 70,     // Aumenta para 70%
  break: 60,   // Aumenta para 60%
}
```

### Ignorar Arquivos

```javascript
ignorePatterns: [
  'server/migrations/**',  // Ignora migrations
  'server/seeds/**',       // Ignora seeds
]
```

---

## 📚 Recursos

- [Stryker Mutator Documentation](https://stryker-mutator.io/)
- [Mutation Testing Best Practices](https://stryker-mutator.io/docs/mutation-testing-elements/supported-mutators/)
- [Dashboard Online](https://dashboard.stryker-mutator.io/)

---

## 🆘 Troubleshooting

### Erro: "Timeout"

Aumente o timeout em `.stryker.conf.mjs`:

```javascript
timeoutMS: 120000,  // 2 minutos
```

### Erro: "Out of Memory"

Reduza workers paralelos:

```javascript
maxConcurrentTestRunners: 1,
```

### Mutation Testing muito lento

Use modo incremental:

```bash
pnpm mutation:incremental
```

---

## 🎯 Metas do Projeto

| Fase | Meta de Mutation Score |
|------|------------------------|
| **Inicial** | ≥ 60% |
| **Intermediária** | ≥ 75% |
| **Avançada** | ≥ 85% |
| **Excelência** | ≥ 90% |

---

**Desenvolvido com ❤️ pela equipe JobMatch AI**
