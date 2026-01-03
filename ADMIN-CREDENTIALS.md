# Credenciais de Administrador

## Conta Admin Padrão

Para acessar o sistema como administrador, use as seguintes credenciais:

**Email:** link@admin.com  
**Senha:** 78592121  
**Role:** admin

## Como Criar a Conta

1. Acesse a página de "Usuários" (visível apenas para admins)
2. Clique em "Novo Usuário"
3. Preencha os dados:
   - Nome: Link Admin
   - Email: link@admin.com
   - Senha: 78592121
   - Role: admin
4. Clique em "Cadastrar"

## Observação

Como o sistema usa OAuth para autenticação, você precisa:
1. Fazer login com sua conta OAuth existente
2. Usar a página de "Usuários" para criar/gerenciar outros usuários
3. Os usuários criados manualmente podem fazer login diretamente com email/senha

## Alternativa: Criar via Banco de Dados

Se você tiver acesso direto ao banco de dados MySQL, execute:

```sql
INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES (
  'Link Admin', 
  'link@admin.com', 
  '$2b$10$hashedpassword', -- Use bcrypt para gerar o hash de '78592121'
  'admin',
  NOW(),
  NOW()
);
```

Para gerar o hash da senha com bcrypt:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('78592121', 10).then(console.log);"
```
