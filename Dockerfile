# ============================================================================
# JobMatch AI - Dockerfile
# ============================================================================
# Multi-stage build para otimizar tamanho da imagem final
# ============================================================================

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:22-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm@10

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm build

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM node:22-alpine AS production

# Instalar pnpm
RUN npm install -g pnpm@10

# Instalar dependências do Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar build do stage anterior
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/client/public ./dist/public
COPY --from=builder --chown=nodejs:nodejs /app/server/templates ./server/templates

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["node", "dist/index.js"]
