# 🔐 Credenciais de Administrador

## Acesso Administrativo

Para acessar a área administrativa do JobMatch AI, utilize as seguintes credenciais:

### 🌐 URL de Login
```
https://jobnow.manus.space/admin/login
```

### 👤 Credenciais
- **Usuário:** `admin`
- **Senha:** `JobMatch@2024`

---

## 📋 Funcionalidades Admin

Após fazer login, você terá acesso às seguintes funcionalidades administrativas:

### Desktop (PC)
O menu admin aparece automaticamente no header com os seguintes itens:

- **Usuários** - Gerenciar usuários do sistema
- **Admin** - Painel administrativo geral
- **Limpeza de Cache** - Limpar cache do sistema
- **Assinaturas** (dropdown)
  - Planos
  - Assinantes
- **Marketing** (dropdown)
  - Estratégias
  - Redes Sociais
- **Logs Cron** - Visualizar logs de execução do cron job

### Mobile
Clique no ícone de menu (☰) no canto superior direito para acessar todas as opções, incluindo as administrativas.

---

## 🔒 Segurança

- As credenciais são armazenadas localmente no `localStorage` após login bem-sucedido
- A sessão persiste até que o usuário faça logout
- O menu admin só é exibido para usuários autenticados como administrador

---

## 🚀 Como Fazer Login

1. Acesse: https://jobnow.manus.space/admin/login
2. Digite o usuário: `admin`
3. Digite a senha: `JobMatch@2024`
4. Clique em "Entrar como Admin"
5. Você será redirecionado para a home com acesso total às funcionalidades admin

---

## 📝 Notas Importantes

- **Não compartilhe** estas credenciais com usuários não autorizados
- Para alterar as credenciais, edite o arquivo `client/src/pages/AdminLogin.tsx`
- Em produção, considere implementar autenticação mais robusta com banco de dados
