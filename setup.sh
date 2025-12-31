#!/bin/bash

# ============================================================================
# JobMatch AI - Script de Setup Automatizado
# ============================================================================
# Este script configura automaticamente o ambiente de desenvolvimento
# para o sistema JobMatch AI em Linux/macOS.
#
# Uso: ./setup.sh
# ============================================================================

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de utilidade
print_header() {
    echo -e "\n${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Banner
print_header "JobMatch AI - Setup Automatizado"
echo "Este script irá configurar automaticamente o ambiente de desenvolvimento."
echo ""

# ============================================================================
# 1. Verificar Pré-requisitos
# ============================================================================
print_header "1. Verificando Pré-requisitos"

# Verificar Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js instalado: $NODE_VERSION"
else
    print_error "Node.js não encontrado!"
    print_info "Por favor, instale Node.js 18+ de: https://nodejs.org/"
    exit 1
fi

# Verificar pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm instalado: $PNPM_VERSION"
else
    print_warning "pnpm não encontrado. Instalando..."
    npm install -g pnpm
    print_success "pnpm instalado com sucesso!"
fi

# Verificar MySQL
if command_exists mysql; then
    MYSQL_VERSION=$(mysql --version | awk '{print $5}' | sed 's/,$//')
    print_success "MySQL instalado: $MYSQL_VERSION"
else
    print_warning "MySQL não encontrado!"
    print_info "O script continuará, mas você precisará instalar MySQL manualmente."
    print_info "Download: https://www.mysql.com/downloads/"
fi

# Verificar Git
if command_exists git; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    print_success "Git instalado: $GIT_VERSION"
else
    print_error "Git não encontrado!"
    print_info "Por favor, instale Git de: https://git-scm.com/"
    exit 1
fi

# ============================================================================
# 2. Instalar Dependências
# ============================================================================
print_header "2. Instalando Dependências"

if [ -f "package.json" ]; then
    print_info "Instalando pacotes npm com pnpm..."
    pnpm install
    print_success "Dependências instaladas com sucesso!"
else
    print_error "package.json não encontrado!"
    print_info "Certifique-se de estar no diretório raiz do projeto."
    exit 1
fi

# ============================================================================
# 3. Configurar Variáveis de Ambiente
# ============================================================================
print_header "3. Configurando Variáveis de Ambiente"

if [ ! -f ".env" ]; then
    print_info "Criando arquivo .env..."
    
    # Gerar JWT Secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    cat > .env << EOF
# ============================================================================
# JobMatch AI - Variáveis de Ambiente
# ============================================================================
# Gerado automaticamente em $(date)
# ============================================================================

# Banco de Dados
DATABASE_URL="mysql://jobmatch_user:jobmatch_password@localhost:3306/jobmatch_ai"

# JWT Secret (gerado automaticamente)
JWT_SECRET="$JWT_SECRET"

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
EOF

    print_success "Arquivo .env criado com sucesso!"
    print_warning "IMPORTANTE: Configure as seguintes variáveis no arquivo .env:"
    print_info "  - BUILT_IN_FORGE_API_KEY (API key do OpenAI/Claude)"
    print_info "  - S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY (credenciais S3)"
else
    print_warning "Arquivo .env já existe. Pulando criação."
fi

# ============================================================================
# 4. Configurar Banco de Dados
# ============================================================================
print_header "4. Configurando Banco de Dados"

if command_exists mysql; then
    print_info "Deseja configurar o banco de dados MySQL agora? (s/n)"
    read -r SETUP_DB
    
    if [ "$SETUP_DB" = "s" ] || [ "$SETUP_DB" = "S" ]; then
        print_info "Digite a senha do root do MySQL:"
        read -s MYSQL_ROOT_PASSWORD
        
        print_info "Criando banco de dados e usuário..."
        
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS jobmatch_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'jobmatch_user'@'localhost' IDENTIFIED BY 'jobmatch_password';
GRANT ALL PRIVILEGES ON jobmatch_ai.* TO 'jobmatch_user'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

        if [ $? -eq 0 ]; then
            print_success "Banco de dados configurado com sucesso!"
            
            print_info "Executando migrações..."
            pnpm db:push
            print_success "Migrações executadas com sucesso!"
        else
            print_error "Erro ao configurar banco de dados."
            print_info "Configure manualmente seguindo INSTALACAO.md"
        fi
    else
        print_warning "Configuração do banco de dados pulada."
        print_info "Configure manualmente seguindo INSTALACAO.md"
    fi
else
    print_warning "MySQL não encontrado. Pulando configuração do banco."
    print_info "Instale MySQL e execute: pnpm db:push"
fi

# ============================================================================
# 5. Verificar Instalação
# ============================================================================
print_header "5. Verificando Instalação"

# Verificar TypeScript
print_info "Verificando erros TypeScript..."
if pnpm check; then
    print_success "Sem erros TypeScript!"
else
    print_warning "Erros TypeScript encontrados. Revise o código."
fi

# ============================================================================
# 6. Finalização
# ============================================================================
print_header "Setup Concluído!"

echo ""
print_success "Ambiente configurado com sucesso!"
echo ""
print_info "Próximos passos:"
echo "  1. Configure as variáveis obrigatórias no arquivo .env"
echo "  2. Execute: pnpm dev"
echo "  3. Acesse: http://localhost:3000"
echo ""
print_info "Documentação completa: INSTALACAO.md"
echo ""
print_header "Bom desenvolvimento! 🚀"
