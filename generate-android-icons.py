#!/usr/bin/env python3.11
from PIL import Image
import os

# Criar diretórios
base_path = 'android/app/src/main/res'
densities = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

for density, size in densities.items():
    os.makedirs(f'{base_path}/{density}', exist_ok=True)

# Redimensionar ícone
print('Gerando ícones do Android...')
icon = Image.open('app-icon.png')

for density, size in densities.items():
    resized = icon.resize((size, size), Image.Resampling.LANCZOS)
    output_path = f'{base_path}/{density}/ic_launcher.png'
    resized.save(output_path)
    print(f'✓ {output_path} ({size}x{size})')

# Gerar ícone redondo
for density, size in densities.items():
    resized = icon.resize((size, size), Image.Resampling.LANCZOS)
    output_path = f'{base_path}/{density}/ic_launcher_round.png'
    resized.save(output_path)
    print(f'✓ {output_path} ({size}x{size})')

print('\n✅ Todos os ícones foram gerados com sucesso!')
