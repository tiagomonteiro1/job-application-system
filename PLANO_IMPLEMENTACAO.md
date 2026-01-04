# Plano de Implementação - JobMatch AI

## Status Atual

✅ **Upload de Currículo Corrigido**: Erro JSON.parse resolvido com tratamento adequado de respostas não-JSON.

---

## Funcionalidades a Implementar

### 1. Sistema de Gestão de Usuários (Admin)

**Objetivo**: Criar interface completa para gerenciar usuários (assinantes e admins).

**Implementação**:
- Criar página `/admin/usuarios` com tabela de usuários
- Implementar CRUD completo:
  - Listar todos os usuários com filtros (role, plano, status)
  - Criar novo usuário manualmente
  - Editar usuário (nome, email, role, plano)
  - Desativar/ativar usuário
  - Resetar senha
- Adicionar item "Usuários" no menu admin
- Criar router TRPC `admin.usuarios` com procedures:
  - `list`: listar usuários com paginação
  - `create`: criar novo usuário
  - `update`: atualizar dados do usuário
  - `delete`: desativar usuário
  - `changeRole`: alterar role (user/admin)

**Arquivos a criar/modificar**:
- `client/src/pages/admin/Usuarios.tsx`
- `server/routers/admin.ts` (criar se não existir)
- Adicionar rota em `client/src/App.tsx`

---

### 2. Formulário de Inscrição na Home

**Objetivo**: Capturar leads e permitir cadastro de novos assinantes diretamente na home.

**Implementação**:
- Adicionar seção "Experimente Grátis" na página Home
- Criar formulário com campos:
  - Nome completo
  - Email
  - Telefone/WhatsApp
  - Área de atuação
  - Aceite de termos
- Integrar com tabela `assinantes` (já existe no schema)
- Enviar email de boas-vindas após cadastro
- Redirecionar para página de onboarding

**Arquivos a criar/modificar**:
- `client/src/pages/Home.tsx` (adicionar seção)
- `client/src/components/FormularioInscricao.tsx`
- `server/routers/assinantes.ts`

---

### 3. Páginas de Atração de Assinantes

**Objetivo**: Criar landing pages para converter visitantes em assinantes.

**Páginas a criar**:

#### 3.1 Página "Sobre" (`/sobre`)
- História do JobMatch AI
- Missão e valores
- Como funciona o sistema
- Benefícios principais

#### 3.2 Página "Planos e Preços" (`/planos`)
- Cards dos 3 planos (Gratuito, Pro, Enterprise)
- Tabela comparativa de funcionalidades
- FAQ sobre planos
- Botão "Assinar Agora"

#### 3.3 Página "Depoimentos" (`/depoimentos`)
- Cards com depoimentos de usuários
- Estatísticas de sucesso
- Casos de uso reais

#### 3.4 Página "FAQ" (`/faq`)
- Perguntas frequentes organizadas por categoria
- Sistema de busca
- Accordion para cada pergunta

**Arquivos a criar**:
- `client/src/pages/Sobre.tsx`
- `client/src/pages/Planos.tsx`
- `client/src/pages/Depoimentos.tsx`
- `client/src/pages/FAQ.tsx`
- Adicionar rotas em `client/src/App.tsx`
- Adicionar links no menu principal

---

### 4. Gestão de Redes Sociais (Admin)

**Objetivo**: Permitir cadastro de redes sociais e envio de mensagens automatizadas.

**Implementação**:

#### 4.1 Cadastro de Redes Sociais
- Criar tabela `redes_sociais_usuario`:
  ```sql
  - id
  - userId
  - rede (facebook, instagram, linkedin, twitter)
  - username
  - accessToken (criptografado)
  - refreshToken (criptografado)
  - ativo
  - createdAt, updatedAt
  ```
- Página `/admin/redes-sociais` com:
  - Lista de redes cadastradas
  - Botão "Conectar Nova Rede"
  - OAuth flow para cada rede social

#### 4.2 Envio de Mensagens
- Formulário com:
  - Campo de mensagem (textarea)
  - Seletor de rede social
  - Preview da mensagem
  - Botão "Enviar"
- Integração com APIs:
  - Facebook Graph API
  - Instagram Graph API
  - LinkedIn API
  - Twitter API v2
- Log de mensagens enviadas

**Arquivos a criar**:
- `drizzle/schema.ts` (adicionar tabela)
- `client/src/pages/admin/RedesSociais.tsx`
- `server/routers/redesSociais.ts`
- `server/integrations/facebook.ts`
- `server/integrations/instagram.ts`
- `server/integrations/linkedin.ts`
- `server/integrations/twitter.ts`

---

### 5. Busca de Assinantes em Redes Sociais

**Objetivo**: Buscar potenciais assinantes em grupos do Facebook e Instagram por nicho.

**Implementação**:

#### 5.1 Interface de Busca
- Página `/admin/buscar-assinantes`
- Formulário com:
  - Campo "Nicho" (ex: "desenvolvedores PHP")
  - Seletor de rede social (Facebook, Instagram)
  - Filtros avançados (localização, idade, etc.)
  - Botão "Buscar"

#### 5.2 Busca no Facebook
- Usar Facebook Graph API
- Buscar em grupos públicos relacionados ao nicho
- Extrair membros dos grupos
- Exibir lista com:
  - Nome
  - Foto de perfil
  - Link do perfil
  - Grupos em comum
  - Botão "Adicionar"

#### 5.3 Busca no Instagram
- Usar Instagram Graph API
- Buscar por hashtags relacionadas ao nicho
- Extrair usuários que postaram
- Exibir lista similar ao Facebook

#### 5.4 Adicionar às Minhas Redes
- Botão "Adicionar" envia solicitação de amizade/seguir
- Salvar em tabela `leads_redes_sociais`:
  ```sql
  - id
  - userId (admin que encontrou)
  - rede
  - nomeUsuario
  - perfilUrl
  - nicho
  - status (pendente, adicionado, rejeitado)
  - createdAt
  ```

**Arquivos a criar**:
- `client/src/pages/admin/BuscarAssinantes.tsx`
- `server/routers/buscarAssinantes.ts`
- `server/integrations/facebookSearch.ts`
- `server/integrations/instagramSearch.ts`
- `drizzle/schema.ts` (adicionar tabela)

**Observação Importante**: As APIs do Facebook e Instagram têm limitações e requerem aprovação de apps. Pode ser necessário usar scraping com Puppeteer como alternativa.

---

### 6. Integração com APIs em Automações

**Objetivo**: Criar interface para configurar integrações com APIs externas.

**Implementação**:

#### 6.1 Página "Integrar com API"
- Rota `/automacoes/integrar-api`
- Formulário com:
  - Nome da integração
  - URL base da API
  - Método de autenticação (API Key, OAuth, Bearer Token)
  - Headers customizados
  - Endpoints disponíveis
  - Mapeamento de campos
  - Teste de conexão

#### 6.2 Gerenciamento de Integrações
- Lista de integrações configuradas
- Status de cada integração (ativa, erro, desativada)
- Logs de requisições
- Botão "Testar Integração"

#### 6.3 Webhooks
- Criar endpoint `/api/webhooks/:integrationId`
- Receber eventos de APIs externas
- Processar e armazenar dados
- Disparar automações baseadas em eventos

**Arquivos a criar**:
- `client/src/pages/Automacoes/IntegrarAPI.tsx`
- `server/routers/integracoes.ts`
- `server/routes/webhooks.ts`
- `drizzle/schema.ts` (adicionar tabela `integracoes_api`)

---

### 7. Correção de Varredura Automática em Notificações

**Objetivo**: Implementar sistema funcional de varredura automática de vagas.

**Problema Atual**: A varredura automática não está funcionando corretamente.

**Implementação**:

#### 7.1 Sistema de Cron Jobs
- Criar arquivo `server/cron/varreduraVagas.ts`
- Implementar lógica de busca em:
  - LinkedIn Jobs API
  - Indeed API
  - Gupy API
  - Sites de vagas via scraping (Puppeteer)
- Executar a cada 1 hora
- Salvar vagas na tabela `vagas_automaticas`

#### 7.2 Notificações em Tempo Real
- Quando novas vagas forem encontradas:
  - Calcular score de compatibilidade
  - Filtrar vagas com score > 70%
  - Enviar notificação via WhatsApp (se configurado)
  - Criar notificação no sistema
- Implementar WebSocket para notificações em tempo real no frontend

#### 7.3 Interface de Monitoramento
- Página `/admin/varredura-automatica`
- Dashboard com:
  - Status da varredura (ativa/inativa)
  - Última execução
  - Próxima execução
  - Vagas encontradas (últimas 24h)
  - Taxa de sucesso
  - Logs de execução
- Botão "Executar Agora" para teste manual

**Arquivos a criar/modificar**:
- `server/cron/varreduraVagas.ts`
- `server/cron/index.ts` (registrar cron job)
- `client/src/pages/admin/VarreduraAutomatica.tsx`
- `server/routers/varredura.ts`

---

### 8. Controle Dinâmico de Páginas e Menus

**Objetivo**: Permitir adicionar novas páginas e itens de menu sem modificar código.

**Implementação**:

#### 8.1 Sistema de Páginas Dinâmicas
- Criar tabela `paginas_dinamicas`:
  ```sql
  - id
  - slug (ex: "/sobre-nos")
  - titulo
  - conteudo (HTML/Markdown)
  - template (default, landing, blog)
  - metaTitulo
  - metaDescricao
  - ativo
  - ordem
  - createdAt, updatedAt
  ```

#### 8.2 Sistema de Menus Dinâmicos
- Criar tabela `itens_menu`:
  ```sql
  - id
  - label
  - url
  - icone
  - ordem
  - menuPai (para submenus)
  - visibilidade (publico, autenticado, admin)
  - ativo
  - createdAt, updatedAt
  ```

#### 8.3 Painel de Controle
- Página `/admin/gerenciar-conteudo`
- Abas:
  - **Páginas**: CRUD de páginas dinâmicas
  - **Menus**: CRUD de itens de menu
  - **Templates**: Gerenciar templates de página
- Editor WYSIWYG para conteúdo (TinyMCE ou Quill)
- Preview em tempo real

#### 8.4 Renderização Dinâmica
- Modificar `client/src/App.tsx` para:
  - Buscar páginas dinâmicas na inicialização
  - Criar rotas automaticamente
  - Renderizar conteúdo baseado no template
- Modificar componente de menu para:
  - Buscar itens de menu do banco
  - Renderizar dinamicamente
  - Aplicar permissões de visibilidade

**Arquivos a criar/modificar**:
- `drizzle/schema.ts` (adicionar tabelas)
- `client/src/pages/admin/GerenciarConteudo.tsx`
- `client/src/components/EditorConteudo.tsx`
- `client/src/components/PaginaDinamica.tsx`
- `client/src/App.tsx` (modificar sistema de rotas)
- `server/routers/paginasDinamicas.ts`
- `server/routers/menusD inamicos.ts`

---

## Ordem de Implementação Recomendada

1. **Sistema de Gestão de Usuários** (2-3 dias)
   - Fundamental para gerenciar assinantes e admins
   
2. **Formulário de Inscrição + Páginas de Atração** (2-3 dias)
   - Essencial para capturar leads e converter visitantes
   
3. **Correção de Varredura Automática** (3-4 dias)
   - Funcionalidade core do sistema
   
4. **Integração com APIs em Automações** (2-3 dias)
   - Permite extensibilidade do sistema
   
5. **Gestão de Redes Sociais** (4-5 dias)
   - Requer integrações complexas com múltiplas APIs
   
6. **Busca de Assinantes** (3-4 dias)
   - Depende da gestão de redes sociais
   
7. **Controle Dinâmico de Páginas** (3-4 dias)
   - Funcionalidade avançada, pode ser implementada por último

**Tempo Total Estimado**: 19-26 dias de desenvolvimento

---

## Considerações Técnicas

### APIs e Integrações Necessárias

1. **Facebook Graph API**
   - Criar app no Facebook Developers
   - Solicitar permissões: `pages_manage_posts`, `groups_access_member_info`
   - Implementar OAuth 2.0

2. **Instagram Graph API**
   - Requer Facebook Business Account
   - Permissões: `instagram_basic`, `instagram_content_publish`

3. **LinkedIn API**
   - Criar app no LinkedIn Developers
   - Permissões: `r_liteprofile`, `w_member_social`

4. **Twitter API v2**
   - Criar app no Twitter Developer Portal
   - Usar OAuth 2.0 com PKCE

5. **WhatsApp Business API**
   - Usar Twilio ou Meta Cloud API
   - Configurar webhook para receber status de entrega

### Segurança

- Criptografar tokens de acesso no banco de dados
- Implementar rate limiting nas APIs
- Validar todas as entradas do usuário
- Usar HTTPS em produção
- Implementar CORS adequadamente
- Adicionar logs de auditoria para ações sensíveis

### Performance

- Implementar cache Redis para dados frequentes
- Usar workers para processamento assíncrono (Bull/BullMQ)
- Otimizar queries do banco de dados
- Implementar paginação em todas as listagens
- Usar CDN para assets estáticos

---

## Próximos Passos Imediatos

1. ✅ **Upload de Currículo Corrigido** - CONCLUÍDO
2. 🔄 **Testar Upload em Produção** - PENDENTE
3. 📝 **Criar Issues no GitHub** para cada funcionalidade
4. 🎨 **Definir Design System** para novas páginas
5. 🔐 **Configurar Apps nas Redes Sociais** (Facebook, Instagram, LinkedIn, Twitter)
6. 📊 **Configurar Monitoramento** (Sentry para erros, Analytics para métricas)

---

## Contato para Dúvidas

Para questões sobre a implementação, consulte:
- Documentação do projeto: `/docs`
- Schema do banco de dados: `/drizzle/schema.ts`
- Rotas da API: `/server/routers`
- Componentes do frontend: `/client/src/components`

---

**Última atualização**: 04/01/2026
**Versão do documento**: 1.0
