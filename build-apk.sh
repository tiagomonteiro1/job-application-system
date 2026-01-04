#!/bin/bash

# Script para gerar APK de Produção do JobMatch AI
# Autor: Sistema JobMatch
# Data: Janeiro 2026

set -e  # Parar em caso de erro

echo "🚀 Iniciando build do APK de Produção..."
echo ""

# 1. Fazer build do frontend
echo "📦 Step 1/4: Building frontend..."
pnpm run build
echo "✅ Frontend build concluído"
echo ""

# 2. Sincronizar com Capacitor
echo "🔄 Step 2/4: Syncing with Capacitor..."
npx cap sync android
echo "✅ Sync concluído"
echo ""

# 3. Gerar APK de Debug (para teste rápido)
echo "🔨 Step 3/4: Building Debug APK..."
cd android
./gradlew assembleDebug
echo "✅ Debug APK gerado em: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""

# 4. Gerar APK de Release (produção)
echo "🎯 Step 4/4: Building Release APK..."
./gradlew assembleRelease
echo "✅ Release APK gerado em: android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo ""

echo "🎉 Build concluído com sucesso!"
echo ""
echo "📱 Para instalar no dispositivo:"
echo "   adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "⚠️  Para produção, assine o APK com:"
echo "   jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \\"
echo "     -keystore sua-keystore.jks \\"
echo "     android/app/build/outputs/apk/release/app-release-unsigned.apk \\"
echo "     alias-da-chave"
echo ""
echo "   zipalign -v 4 app-release-unsigned.apk jobmatch-release.apk"
