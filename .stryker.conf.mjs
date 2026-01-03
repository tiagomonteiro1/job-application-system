/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.ts',
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  
  // Arquivos a serem mutados
  mutate: [
    'server/**/*.ts',
    '!server/**/*.test.ts',
    '!server/**/*.spec.ts',
    '!server/index.ts',
    '!server/**/*.d.ts',
  ],

  // Configuração de mutadores
  mutator: {
    plugins: ['@stryker-mutator/typescript-checker'],
    
    // Mutadores habilitados
    // Remova mutadores específicos se causar falsos positivos
    excludedMutations: [
      // 'StringLiteral', // Descomente para ignorar mutações em strings literais
      // 'BlockStatement', // Descomente para ignorar remoção de blocos
    ],
  },

  // Tipos de mutações disponíveis:
  // - ArithmeticOperator: +, -, *, /, %
  // - ArrayDeclaration: [] mutations
  // - ArrowFunction: () => mutations
  // - BlockStatement: {} removal
  // - BooleanLiteral: true <-> false
  // - ConditionalExpression: a ? b : c mutations
  // - EqualityOperator: ==, !=, ===, !==
  // - LogicalOperator: &&, ||, ??
  // - MethodExpression: method call mutations
  // - ObjectLiteral: {} mutations
  // - OptionalChaining: ?. mutations
  // - StringLiteral: string mutations
  // - UnaryOperator: +, -, ~, !
  // - UpdateOperator: ++, --
  // - RegexLiteral: regex mutations

  // Relatórios
  reporters: [
    'html',           // Relatório HTML interativo
    'clear-text',     // Saída no terminal
    'progress',       // Barra de progresso
    'json',           // Relatório JSON
    'dashboard',      // Dashboard online (requer configuração)
  ],

  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },

  jsonReporter: {
    fileName: 'reports/mutation/mutation-report.json',
  },

  // Thresholds de qualidade
  thresholds: {
    high: 80,    // >= 80% = excelente
    low: 60,     // < 60% = precisa melhorar
    break: 50,   // < 50% = falha no CI
  },

  // Performance
  coverageAnalysis: 'perTest',  // Mais rápido, usa coverage existente
  timeoutMS: 60000,             // Timeout por teste (60s)
  timeoutFactor: 1.5,           // Multiplicador de timeout
  maxConcurrentTestRunners: 2,  // Número de workers paralelos
  
  // Type checking
  disableTypeChecks: false,     // Habilita verificação de tipos

  // Arquivos ignorados
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    'tests/**',
    '**/*.d.ts',
    '**/*.config.ts',
    '**/*.config.js',
    'client/**',  // Ignora frontend (foco no backend)
  ],

  // Modo incremental (salva resultados entre execuções)
  incremental: true,
  incrementalFile: '.stryker-tmp/incremental.json',

  // Dashboard online (opcional)
  dashboard: {
    project: 'github.com/seu-usuario/job-application-system',
    version: 'main',
    module: 'backend',
    baseUrl: 'https://dashboard.stryker-mutator.io/api/reports',
  },

  // Plugins
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
  ],

  // Configurações avançadas
  buildCommand: 'pnpm build',
  cleanTempDir: true,
  tempDirName: '.stryker-tmp',
  
  // Logging
  logLevel: 'info',  // 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  fileLogLevel: 'info',
  allowConsoleColors: true,
};
