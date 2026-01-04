# 📱 Guia do Aplicativo Android - JobMatch AI

## ✅ Configuração Concluída

O aplicativo Android foi configurado com sucesso usando **Capacitor 8.0**. Os arquivos nativos Android estão localizados em `/android`.

---

## 🎯 Informações do Aplicativo

- **Nome do App**: JobMatch AI
- **Package ID**: com.jobmatch.app
- **Plataforma**: Android (Capacitor 8.0)
- **Diretório Web**: dist/public

---

## 📦 Plugins Capacitor Instalados

O aplicativo inclui os seguintes plugins nativos:

1. **@capacitor/camera** (8.0.0) - Acesso à câmera do dispositivo
2. **@capacitor/push-notifications** (8.0.0) - Notificações push
3. **@capacitor/share** (8.0.0) - Compartilhamento nativo
4. **@capacitor/splash-screen** (8.0.0) - Tela de splash
5. **@capacitor/status-bar** (8.0.0) - Controle da barra de status

---

## 🔧 Como Gerar o APK

### Opção 1: Usando Android Studio (Recomendado)

1. **Abrir o projeto no Android Studio**:
   ```bash
   npx cap open android
   ```

2. **Aguardar sincronização do Gradle**

3. **Gerar APK de Debug**:
   - Menu: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - APK gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

4. **Gerar APK de Release (Produção)**:
   - Menu: `Build` → `Generate Signed Bundle / APK`
   - Selecione `APK` → `Next`
   - Configure keystore (ou crie um novo)
   - APK gerado em: `android/app/build/outputs/apk/release/app-release.apk`

### Opção 2: Via Linha de Comando

1. **Build de Debug**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   APK em: `android/app/build/outputs/apk/debug/app-debug.apk`

2. **Build de Release**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   APK em: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## 🔄 Workflow de Desenvolvimento

### 1. Fazer alterações no código web
```bash
# Editar arquivos em client/src/
```

### 2. Fazer build do frontend
```bash
pnpm run build
```

### 3. Sincronizar com Android
```bash
npx cap sync android
```

### 4. Testar no emulador ou dispositivo
```bash
npx cap run android
```

---

## 📝 Comandos Úteis

```bash
# Sincronizar código web com Android
npx cap sync android

# Abrir Android Studio
npx cap open android

# Executar no dispositivo/emulador
npx cap run android

# Atualizar plugins Capacitor
npx cap update android

# Limpar cache do Capacitor
npx cap sync android --clean
```

---

## 🎨 Personalização

### Ícone do App
Substitua os arquivos em:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Splash Screen
Edite:
- `android/app/src/main/res/drawable/splash.png`

### Cores e Tema
Configure em:
- `android/app/src/main/res/values/styles.xml`

---

## 🚀 Publicação na Google Play Store

### 1. Criar Keystore
```bash
keytool -genkey -v -keystore jobmatch-release.keystore -alias jobmatch -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar Gradle
Adicione em `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("path/to/jobmatch-release.keystore")
            storePassword "sua-senha"
            keyAlias "jobmatch"
            keyPassword "sua-senha"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Gerar APK/AAB de Release
```bash
cd android
./gradlew bundleRelease  # Para AAB (recomendado pela Google)
./gradlew assembleRelease  # Para APK
```

### 4. Testar o APK
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 5. Upload na Play Console
- Acesse: https://play.google.com/console
- Crie um novo app
- Faça upload do AAB
- Configure listagem da loja
- Envie para revisão

---

## ⚠️ Requisitos do Sistema

- **Android Studio**: Arctic Fox ou superior
- **JDK**: 11 ou superior
- **Android SDK**: API Level 22+ (Android 5.1+)
- **Gradle**: 7.0+ (incluído no projeto)

---

## 🐛 Troubleshooting

### Erro: "SDK location not found"
```bash
# Criar android/local.properties
echo "sdk.dir=/path/to/Android/Sdk" > android/local.properties
```

### Erro de Build Gradle
```bash
cd android
./gradlew clean
./gradlew build
```

### App não atualiza após mudanças
```bash
pnpm run build
npx cap sync android --clean
```

---

## 📱 Recursos Nativos Disponíveis

O app tem acesso a:
- ✅ Câmera e galeria de fotos
- ✅ Notificações push
- ✅ Compartilhamento nativo
- ✅ Splash screen customizável
- ✅ Controle da barra de status
- ✅ Armazenamento local (localStorage)
- ✅ Geolocalização (se necessário)

---

## 🔗 Links Úteis

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Guia Android Studio](https://developer.android.com/studio/intro)
- [Google Play Console](https://play.google.com/console)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a documentação oficial do Capacitor
2. Consulte os logs do Android Studio
3. Execute `npx cap doctor` para diagnóstico

---

**Última atualização**: Janeiro 2026
**Versão do Capacitor**: 8.0.0
