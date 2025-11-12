#!/usr/bin/env python3
"""
Script para generar iconos en diferentes tamaños para web app
"""
from PIL import Image
import os

# Ruta de la imagen fuente
source_image = 'icons/IMG-20251112-WA0074.jpg'
icons_dir = 'icons'

# Asegurar que el directorio existe
os.makedirs(icons_dir, exist_ok=True)

# Abrir la imagen fuente
print(f"Abriendo imagen fuente: {source_image}")
img = Image.open(source_image)

# Convertir a RGB si es necesario (para compatibilidad)
if img.mode != 'RGB':
    img = img.convert('RGB')

# Tamaños a generar
sizes = {
    'favicon-16.png': (16, 16),
    'favicon-32.png': (32, 32),
    'favicon-48.png': (48, 48),
    'apple-touch-icon.png': (180, 180),
    'icon-192.png': (192, 192),
    'icon-512.png': (512, 512),
}

print(f"Imagen fuente: {img.size} ({img.mode})")
print("\nGenerando iconos:")

# Generar cada tamaño
for filename, size in sizes.items():
    output_path = os.path.join(icons_dir, filename)

    # Redimensionar con antialiasing para mejor calidad
    resized = img.resize(size, Image.Resampling.LANCZOS)

    # Guardar
    resized.save(output_path, optimize=True, quality=95)
    print(f"  ✓ {output_path} ({size[0]}x{size[1]})")

# Generar favicon.ico con múltiples tamaños
print("\nGenerando favicon.ico con múltiples tamaños...")
favicon_sizes = [(16, 16), (32, 32), (48, 48)]
favicon_images = []

for size in favicon_sizes:
    resized = img.resize(size, Image.Resampling.LANCZOS)
    favicon_images.append(resized)

favicon_path = os.path.join(icons_dir, 'favicon.ico')
favicon_images[0].save(
    favicon_path,
    format='ICO',
    sizes=[(img.width, img.height) for img in favicon_images],
    append_images=favicon_images[1:]
)
print(f"  ✓ {favicon_path} (16x16, 32x32, 48x48)")

print("\n✅ Todos los iconos han sido generados exitosamente!")
