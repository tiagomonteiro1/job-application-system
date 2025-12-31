# ============================================================================
# JobMatch AI - Script de Setup Automatizado (Windows)
# ============================================================================
# Este script configura automaticamente o ambiente de desenvolvimento
# para o sistema JobMatch AI no Windows.
#
# Uso: .\setup.ps1
# Nota: Execute como Administrador se necessário
# ============================================================================

# Configurar política de execução (se necessário)
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Cores para output
function Write-Header {
    param([string]$Message)
    Write-Host "`n============================================================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "============================================================================`n" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# Banner
Write-Header "JobMatch AI - Setup Automatizado (Windows)"
Write-Host "Este script irá configurar automaticamente o ambiente de desenvolvimento.`n"

# ============================================================================
# 1. Verificar Pré-requisitos
# ============================================================================
Write-Header "1. Verificando Pré-requisitos"

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js instalado: $nodeVersion"
} catch {
    Write-Error-Custom "Node.js não encontrado!"
    Write-Info "Por favor, instale Node.js 18+ de: https://nodejs.org/"
    exit 1
}

# Verificar pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Success "pnpm instalado: $pnpmVersion"
} catch {
    Write-Warning-Custom "pnpm não encontrado. Instalando..."
    npm install -g pnpm
    Write-Success "pnpm instalado com sucesso!"
}

# Verificar MySQL
try {
    $mysqlVersion = mysql --version
    Write-Success "MySQL instalado: $mysqlVersion"
} catch {
    Write-Warning-Custom "MySQL não encontrado!"
    Write-Info "O script continuará, mas você precisará instalar MySQL manualmente."
    Write-Info "Download: https://dev.mysql.com/downloads/installer/"
}

# Verificar Git
try {
    $gitVersion = git --version
    Write-Success "Git instalado: $gitVersion"
} catch {
    Write-Error-Custom "Git não encontrado!"
    Write-Info "Por favor, instale Git de: https://git-scm.com/"
    exit 1
}

# ============================================================================
# 2. Instalar Dependências
# ============================================================================
Write-Header "2. Instalando Dependências"

if (Test-Path "package.json") {
    Write-Info "Instalando pacotes npm com pnpm..."
    pnpm install
    Write-Success "Dependências instaladas com sucesso!"
} else {
    Write-Error-Custom "package.json não encontrado!"
    Write-Info "Certifique-se de estar no diretório raiz do projeto."
    exit 1
}

# ============================================================================
# 3. Configurar Variáveis de Ambiente
# ============================================================================
Write-Header "3. Configurando Variáveis de Ambiente"

if (-not (Test-Path ".env")) {
    Write-Info "Criando arquivo .env..."
    
    # Gerar JWT Secret
    $jwtSecret = -join ((1..128) | ForEach-Object { "{0:X}" -f (Get-Random -Maximum 16) })
    
    $envContent = @"
# ============================================================================
# JobMatch AI - Variáveis de Ambiente
# ============================================================================
# Gerado automaticamente em $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ============================================================================

# Banco de Dados
DATABASE_URL="mysql://jobmatch_user:jobmatch_password@localhost:3306/jobmatch_ai"

# JWT Secret (gerado automaticamente)
JWT_SECRET="$jwtSecret"

# OAuth (opcional - configure se necessário)
OAUTH_SERVER_URL="https://api.manus.im"
OAUTH_CLIENT_ID=""
OAUTH_CLIENT_SECRET=""

# LLM API (configure com sua API key)
BUILT_IN_FORGE_API_KEY=""
BUILT_IN_FORGE_API_URL="https://api.openai.com/v1"
VITE_FRONTEND_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_URL="https://api.openai.com/v1"

# S3 Storage (configure com suas credenciais)
S3_ENDPOINT=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_BUCKET="jobmatch-curriculos"
S3_REGION="us-east-1"

# Frontend
VITE_APP_TITLE="JobMatch AI"
VITE_APP_LOGO="/logo.png"
VITE_APP_ID="jobmatch-ai"

# Servidor
PORT=3000
NODE_ENV=development

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=""
VITE_ANALYTICS_WEBSITE_ID=""
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Success "Arquivo .env criado com sucesso!"
    Write-Warning-Custom "IMPORTANTE: Configure as seguintes variáveis no arquivo .env:"
    Write-Info "  - BUILT_IN_FORGE_API_KEY (API key do OpenAI/Claude)"
    Write-Info "  - S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY (credenciais S3)"
} else {
    Write-Warning-Custom "Arquivo .env já existe. Pulando criação."
}

# ============================================================================
# 4. Configurar Banco de Dados
# ============================================================================
Write-Header "4. Configurando Banco de Dados"

try {
    $null = mysql --version
    $setupDb = Read-Host "Deseja configurar o banco de dados MySQL agora? (s/n)"
    
    if ($setupDb -eq "s" -or $setupDb -eq "S") {
        $mysqlPassword = Read-Host "Digite a senha do root do MySQL" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
        $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        Write-Info "Criando banco de dados e usuário..."
        
        $sqlScript = @"
CREATE DATABASE IF NOT EXISTS jobmatch_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'jobmatch_user'@'localhost' IDENTIFIED BY 'jobmatch_password';
GRANT ALL PRIVILEGES ON jobmatch_ai.* TO 'jobmatch_user'@'localhost';
FLUSH PRIVILEGES;
"@

        $sqlScript | mysql -u root -p"$plainPassword" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Banco de dados configurado com sucesso!"
            
            Write-Info "Executando migrações..."
            pnpm db:push
            Write-Success "Migrações executadas com sucesso!"
        } else {
            Write-Error-Custom "Erro ao configurar banco de dados."
            Write-Info "Configure manualmente seguindo INSTALACAO.md"
        }
    } else {
        Write-Warning-Custom "Configuração do banco de dados pulada."
        Write-Info "Configure manualmente seguindo INSTALACAO.md"
    }
} catch {
    Write-Warning-Custom "MySQL não encontrado. Pulando configuração do banco."
    Write-Info "Instale MySQL e execute: pnpm db:push"
}

# ============================================================================
# 5. Verificar Instalação
# ============================================================================
Write-Header "5. Verificando Instalação"

Write-Info "Verificando erros TypeScript..."
pnpm check
if ($LASTEXITCODE -eq 0) {
    Write-Success "Sem erros TypeScript!"
} else {
    Write-Warning-Custom "Erros TypeScript encontrados. Revise o código."
}

# ============================================================================
# 6. Finalização
# ============================================================================
Write-Header "Setup Concluído!"

Write-Host ""
Write-Success "Ambiente configurado com sucesso!"
Write-Host ""
Write-Info "Próximos passos:"
Write-Host "  1. Configure as variáveis obrigatórias no arquivo .env"
Write-Host "  2. Execute: pnpm dev"
Write-Host "  3. Acesse: http://localhost:3000"
Write-Host ""
Write-Info "Documentação completa: INSTALACAO.md"
Write-Host ""
Write-Header "Bom desenvolvimento! 🚀"
