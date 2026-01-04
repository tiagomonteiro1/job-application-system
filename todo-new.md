# TODO - Implementações Urgentes

## 1. Correção Crítica de Upload
- [x] Investigar por que erro JSON.parse persiste após correção - Erro ao tentar parsear HTML como JSON
- [x] Corrigir definitivamente upload de currículo - Adicionado try-catch para respostas não-JSON
- [ ] Testar upload em produção

## 2. Sistema de Gestão de Usuários
- [ ] Criar item "Usuários" no menu admin
- [ ] Implementar CRUD de usuários (assinantes e admins)
- [ ] Criar formulário de cadastro de usuário
- [ ] Implementar níveis de permissão (admin, assinante)

## 3. Formulário de Inscrição e Landing Pages
- [ ] Criar formulário de inscrição na página Home
- [ ] Criar página "Sobre" para atrair assinantes
- [ ] Criar página "Planos e Preços"
- [ ] Criar página "Depoimentos"
- [ ] Criar página "FAQ"

## 4. Gestão de Redes Sociais
- [ ] Criar item "Redes Sociais" no menu admin
- [ ] Implementar campo para mensagem
- [ ] Implementar cadastro de redes sociais do usuário
- [ ] Integrar envio de mensagem para rede selecionada (Facebook, Instagram, LinkedIn, Twitter)
- [ ] Criar API para integração com redes sociais

## 5. Busca de Assinantes
- [ ] Criar item "Buscar Assinantes" no menu admin
- [ ] Implementar campo de nicho
- [ ] Integrar busca em grupos do Facebook
- [ ] Integrar busca no Instagram
- [ ] Exibir lista de usuários encontrados
- [ ] Criar função para adicionar usuários às minhas redes

## 6. Integrações API em Automações
- [ ] Criar página "Integrar com API" em Automações
- [ ] Implementar formulário de configuração de API
- [ ] Criar sistema de webhooks
- [ ] Documentar APIs disponíveis

## 7. Correção de Notificações
- [ ] Corrigir erro de varredura automática
- [ ] Implementar varredura funcional
- [ ] Testar notificações em tempo real

## 8. Controle Dinâmico de Páginas
- [ ] Criar painel de controle de páginas
- [ ] Implementar adição dinâmica de menus
- [ ] Criar sistema de templates de página
- [ ] Implementar editor de conteúdo

## 9. Testes Rigorosos
- [ ] Testar todas as funcionalidades de upload
- [ ] Testar CRUD de usuários
- [ ] Testar integrações de redes sociais
- [ ] Testar busca de assinantes
- [ ] Testar automações
- [ ] Testar notificações
- [ ] Verificar responsividade
- [ ] Verificar segurança

## Gestão de Usuários - Em Implementação
- [x] Criar router TRPC admin.usuarios
- [x] Implementar procedures: list, create, update, delete, changeRole
- [x] Criar página /admin/usuarios
- [x] Implementar tabela com filtros (role, plano, status)
- [x] Implementar paginação
- [x] Criar modal de criação de usuário
- [x] Criar modal de edição de usuário
- [x] Adicionar botão de desativar/ativar usuário
- [x] Adicionar item "Usuários" no menu admin
- [x] Testar CRUD completo - Usuário criado com sucesso!
