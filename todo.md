# Project TODO

## Gerenciamento de Usuários
- [x] Criar funções de banco de dados para CRUD de usuários
- [x] Criar tRPC router para gerenciamento de usuários
- [x] Implementar permissões (apenas admin pode gerenciar)
- [x] Criar página de gerenciamento de usuários
- [x] Implementar formulários de cadastro
- [x] Implementar formulários de edição
- [x] Implementar exclusão com confirmação
- [x] Adicionar estatísticas de usuários
- [x] Adicionar menu "Usuários" (visível apenas para admin)
- [x] Sistema 100% funcional

## Correção de Erro de Login
- [x] Investigar erro de login reportado pelo usuário
- [x] Sistema já está funcionando corretamente

## Criar Conta Admin e Corrigir Envio de Currículo
- [x] Documentar credenciais admin (ADMIN-CREDENTIALS.md)
- [x] Criar script para gerar conta admin
- [x] Verificar fluxo de autenticação no envio de currículo
- [x] Sistema funcionando corretamente - erro de login é esperado quando sessão expira
- [x] Usuário pode criar conta admin via interface de Usuários


## Validação de Entrega de Currículo
- [x] Adicionar campos no schema: status_entrega, link_validacao, observacoes_entrega, data_confirmacao
- [x] Criar API para confirmar entrega
- [x] Criar API para adicionar observações de entrega
- [x] Atualizar página de Histórico com status de entrega
- [x] Adicionar botão "Confirmar Entrega"
- [x] Adicionar link para acessar cadastro no site da empresa
- [x] Adicionar campo de observações (protocolo, data, etc.)
- [x] Mostrar histórico de validações
- [x] Executar SQL no banco

## Sistema de Notificações via WhatsApp
- [x] Criar schema para configurações de notificação
- [x] Criar schema para histórico de notificações
- [x] Criar schema para grupos WhatsApp
- [x] Criar APIs para vincular número WhatsApp
- [x] Criar APIs para gerenciar grupos (CRUD completo)
- [x] Criar APIs para enviar notificações
- [x] Registrar notificacoesRouter no appRouter
- [x] Executar SQL para criar tabelas
- [ ] Criar página de Notificações
- [ ] Adicionar formulário de vinculação WhatsApp
- [ ] Adicionar gerenciamento de grupos
- [ ] Adicionar histórico de notificações enviadas
- [ ] Integrar com Twilio ou WhatsApp Business API
- [ ] Implementar envio automático quando novas vagas
- [ ] Testar sistema completo


## Sistema de Assinaturas e Planos
- [x] Criar schema para planos (nome, preço, descrição, módulos permitidos)
- [x] Criar schema para assinaturas (usuário, plano, status, data início, data fim)
- [x] Criar APIs para CRUD de planos
- [x] Criar APIs para CRUD de assinaturas
- [x] Criar APIs para vincular usuário a plano
- [x] Criar página de Categorias/Planos
- [x] Criar formulário de cadastro de plano
- [x] Adicionar seleção de módulos permitidos (ACL)
- [x] Criar página de Assinantes
- [x] Criar formulário de cadastro de assinante
- [x] Implementar sistema ACL de controle de acesso
- [x] Proteger rotas baseado no plano do usuário
- [x] Adicionar menu "Assinaturas" com submenus
- [x] Testar sistema completo


## Correção de Erros do Sistema
- [x] Adicionar colunas faltantes na tabela candidaturas (status_entrega, link_validacao, observacoes_entrega, data_confirmacao)
- [x] Verificar e corrigir schema de todas as tabelas
- [x] Executar todos os SQLs pendentes
- [x] Testar queries do banco de dados
- [x] Verificar erros de TypeScript
- [x] Testar sistema completo
- [x] Garantir que todas as funcionalidades estão operacionais


## Implementação de Notificações por WhatsApp (Frontend)
- [x] Criar página de Notificações (/notificacoes)
- [x] Implementar formulário de vinculação de número WhatsApp
- [x] Adicionar toggle de ativação de notificações
- [x] Criar seção de preferências de notificação
- [x] Implementar gerenciamento de grupos WhatsApp (CRUD)
- [x] Criar visualização de histórico de notificações
- [x] Adicionar filtros no histórico (tipo, status, data)
- [x] Implementar envio de notificação de teste
- [x] Adicionar menu "Notificações" no header
- [x] Testar sistema completo de notificações
