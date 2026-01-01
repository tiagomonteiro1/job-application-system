# 📱 Guia Completo: Build e Publicação do JobMatch AI na Google Play Store

## ✅ O que já foi configurado

O projeto JobMatch AI já está **100% preparado** para ser transformado em um aplicativo Android:

- ✅ **Capacitor instalado** e configurado (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
- ✅ **Projeto Android criado** em `/android`
- ✅ **Ícones gerados** em todas as densidades (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- ✅ **Splash screen** criado com branding completo
- ✅ **Plugins nativos instalados**:
  - `@capacitor/camera` - Acesso à câmera
  - `@capacitor/push-notifications` - Notificações push
  - `@capacitor/share` - Compartilhamento
  - `@capacitor/status-bar` - Barra de status
  - `@capacitor/splash-screen` - Tela de abertura
- ✅ **Build web** funcionando (`dist/public`)

---

## 🛠️ Pré-requisitos

Para gerar o APK/AAB final, você precisará instalar em sua máquina local:

1. **Android Studio** (versão mais recente)
   - Download: https://developer.android.com/studio
   - Inclui Android SDK, emuladores e ferramentas de build

2. **Java JDK 17** (requerido pelo Android Studio)
   - Download: https://www.oracle.com/java/technologies/downloads/

3. **Node.js 18+** (já instalado no projeto)

---

## 📦 Passo 1: Clonar o Projeto Localmente

```bash
# Clone o repositório do GitHub
git clone https://github.com/seu-usuario/job-application-system.git
cd job-application-system

# Instale as dependências
pnpm install

# Faça o build do projeto web
pnpm run build
```

---

## 🔧 Passo 2: Sincronizar com Android

```bash
# Sincronizar arquivos web com o projeto Android
npx cap sync android

# Abrir o projeto no Android Studio
npx cap open android
```

---

## 🎨 Passo 3: Configurar no Android Studio

### 3.1. Atualizar `build.gradle` (Module: app)

Localize `/android/app/build.gradle` e configure:

```gradle
android {
    namespace "com.jobmatch.ai"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.jobmatch.ai"
        minSdk 22
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            // Assinar com keystore (configurar no Passo 4)
            signingConfig signingConfigs.release
        }
    }
    
    signingConfigs {
        release {
            storeFile file(RELEASE_STORE_FILE)
            storePassword RELEASE_STORE_PASSWORD
            keyAlias RELEASE_KEY_ALIAS
            keyPassword RELEASE_KEY_PASSWORD
        }
    }
}
```

### 3.2. Configurar Permissões no `AndroidManifest.xml`

Localize `/android/app/src/main/AndroidManifest.xml` e adicione:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissões -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <application
        android:label="JobMatch AI"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme"
        android:allowBackup="true"
        android:supportsRtl="true">
        
        <!-- Atividade principal -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 3.3. Configurar Cores e Tema

Localize `/android/app/src/main/res/values/styles.xml` e configure:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Tema base -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">#6B46C1</item>
        <item name="colorPrimaryDark">#5A3AA0</item>
        <item name="colorAccent">#3B82F6</item>
        <item name="android:statusBarColor">#6B46C1</item>
    </style>
    
    <!-- Tema para splash screen -->
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme">
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
```

---

## 🔐 Passo 4: Gerar Keystore para Assinatura

O APK/AAB precisa ser assinado para publicação na Play Store.

```bash
# Gerar keystore (executar na raiz do projeto)
keytool -genkey -v -keystore jobmatch-release.keystore -alias jobmatch -keyalg RSA -keysize 2048 -validity 10000

# Preencher as informações solicitadas:
# - Senha do keystore (guarde com segurança!)
# - Nome, organização, cidade, estado, país
```

### 4.1. Configurar Credenciais

Crie o arquivo `/android/keystore.properties`:

```properties
RELEASE_STORE_FILE=../jobmatch-release.keystore
RELEASE_STORE_PASSWORD=sua_senha_aqui
RELEASE_KEY_ALIAS=jobmatch
RELEASE_KEY_PASSWORD=sua_senha_aqui
```

⚠️ **IMPORTANTE**: Adicione `keystore.properties` ao `.gitignore` para não expor suas credenciais!

---

## 📦 Passo 5: Gerar APK/AAB

### Opção A: Gerar APK (para testes)

```bash
cd android
./gradlew assembleRelease

# APK gerado em:
# android/app/build/outputs/apk/release/app-release.apk
```

### Opção B: Gerar AAB (para Play Store)

```bash
cd android
./gradlew bundleRelease

# AAB gerado em:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🚀 Passo 6: Publicar na Google Play Store

### 6.1. Criar Conta de Desenvolvedor

1. Acesse https://play.google.com/console
2. Pague a taxa única de **$25 USD**
3. Complete o perfil de desenvolvedor

### 6.2. Criar Novo Aplicativo

1. Clique em "Criar app"
2. Preencha:
   - **Nome**: JobMatch AI
   - **Idioma padrão**: Português (Brasil)
   - **Tipo**: App
   - **Gratuito/Pago**: Gratuito

### 6.3. Configurar Ficha da Loja

**Descrição curta** (80 caracteres):
```
Sistema inteligente de candidaturas com IA para encontrar vagas perfeitas
```

**Descrição completa** (4000 caracteres):
```
🚀 JobMatch AI - Encontre Sua Vaga Ideal com Inteligência Artificial

O JobMatch AI revoluciona a forma como você busca emprego! Nossa plataforma usa IA avançada para analisar seu currículo e encontrar as vagas mais compatíveis com seu perfil profissional.

✨ RECURSOS PRINCIPAIS:

📊 Análise Inteligente de Compatibilidade
• IA analisa seu currículo e compara com milhares de vagas
• Pontuação de compatibilidade de 0 a 100%
• Recomendações personalizadas baseadas em suas habilidades

🎯 Candidaturas Automatizadas
• Envio automático de currículos para vagas compatíveis
• Follow-ups inteligentes via WhatsApp e Email
• Histórico completo de todas as candidaturas

📱 Notificações em Tempo Real
• Alertas de novas vagas compatíveis
• Notificações de respostas das empresas
• Lembretes de follow-ups pendentes

📈 Dashboard Completo
• Estatísticas de candidaturas
• Taxa de sucesso e conversão
• Análise de áreas mais demandadas

🤖 Automações Inteligentes
• Varredura automática de sites de vagas
• Extração inteligente de requisitos
• Agendamento de follow-ups

💼 Marketing Profissional
• Links rastreáveis para redes sociais
• Análise de origem de assinantes
• Estratégias de captação

🔒 Segurança e Privacidade
• Dados criptografados
• Autenticação segura
• Controle total sobre suas informações

---

POR QUE ESCOLHER O JOBMATCH AI?

✅ Economize Tempo: Automatize candidaturas e follow-ups
✅ Aumente Chances: IA encontra vagas perfeitas para você
✅ Organize-se: Histórico completo em um só lugar
✅ Destaque-se: Follow-ups automáticos mostram proatividade
✅ Gratuito: Plano básico com recursos essenciais

---

PLANOS DISPONÍVEIS:

🆓 Básico (Gratuito)
• 10 candidaturas/mês
• 3 currículos
• Análise básica

⭐ Premium
• 50 candidaturas/mês
• 10 currículos
• Follow-ups automáticos
• Notificações push

🚀 Profissional
• Candidaturas ilimitadas
• Currículos ilimitados
• Automações avançadas
• Suporte prioritário

---

Baixe agora e transforme sua busca por emprego! 🎯
```

**Screenshots** (mínimo 2, máximo 8):
- Capture telas do sistema web em modo mobile
- Recomendado: Home, Vagas, Candidaturas, Follow-ups, Dashboard

**Ícone do app**:
- Use `app-icon.png` (já gerado)
- Formato: PNG 512x512px

**Banner de recursos**:
- Tamanho: 1024x500px
- Crie um banner destacando os principais recursos

### 6.4. Classificação de Conteúdo

1. Preencha o questionário de classificação
2. Para JobMatch AI:
   - **Categoria**: Produtividade
   - **Conteúdo**: Nenhum conteúdo sensível
   - **Classificação esperada**: Livre (L)

### 6.5. Upload do AAB

1. Vá em "Produção" → "Criar nova versão"
2. Faça upload do `app-release.aab`
3. Preencha as notas da versão:

```
Versão 1.0.0 - Lançamento Inicial

✨ Novidades:
• Sistema completo de candidaturas com IA
• Análise de compatibilidade inteligente
• Follow-ups automáticos via WhatsApp/Email
• Dashboard com estatísticas
• Notificações push
• Módulo de marketing
• Painel administrativo

🎯 Recursos:
• Varredura automática de vagas
• Múltiplos currículos
• Histórico completo
• Automações inteligentes
• Links rastreáveis
```

4. Clique em "Revisar versão"
5. Clique em "Iniciar lançamento para produção"

### 6.6. Aguardar Aprovação

- **Primeira análise**: 1-3 dias
- **Atualizações futuras**: algumas horas

---

## 🔄 Atualizações Futuras

Para publicar novas versões:

1. Atualize `versionCode` e `versionName` em `build.gradle`
2. Faça as alterações no código
3. Execute `pnpm run build`
4. Execute `npx cap sync android`
5. Gere novo AAB: `./gradlew bundleRelease`
6. Faça upload na Play Console

---

## 🐛 Troubleshooting

### Erro: "App not installed"
- Desinstale a versão anterior antes de instalar o APK

### Erro: "Signing key mismatch"
- Use sempre o mesmo keystore para assinar o app

### Erro: "Build failed"
- Verifique se o Android SDK está instalado
- Execute `./gradlew clean` e tente novamente

### Erro: "Capacitor not found"
- Execute `pnpm install` para instalar dependências

---

## 📞 Suporte

Para dúvidas sobre o processo de publicação:
- Documentação Capacitor: https://capacitorjs.com/docs/android
- Google Play Console: https://support.google.com/googleplay/android-developer
- Documentação Android: https://developer.android.com/studio/publish

---

## ✅ Checklist Final

Antes de publicar, verifique:

- [ ] Ícones gerados em todas as densidades
- [ ] Splash screen configurado
- [ ] Permissões corretas no AndroidManifest.xml
- [ ] Keystore gerado e configurado
- [ ] AAB assinado gerado
- [ ] Screenshots capturadas
- [ ] Descrições preenchidas
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados
- [ ] Classificação de conteúdo completa
- [ ] Conta de desenvolvedor ativa

---

**Boa sorte com a publicação! 🚀**
