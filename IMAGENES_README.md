# Cómo añadir imágenes reales de los medicamentos

## Fuentes recomendadas para obtener imágenes:

### 1. AEMPS (Agencia Española de Medicamentos)
- Web: https://cima.aemps.es
- Buscar cada medicamento y descargar imagen de la ficha técnica

### 2. Bases de datos farmacéuticas
- Vademecum España: https://www.vademecum.es/
- Bot PLUS: https://botplusweb.portalfarma.com/

### 3. Prospecto del medicamento
- Fotografiar o escanear la sección "Aspecto del medicamento"

## Nombres de archivos necesarios:

Guardar en la carpeta `/images/` con estos nombres:

- `rubifen.jpg` o `rubifen.png` - Comprimidos Rubifen®
- `medikinet.jpg` o `medikinet.png` - Cápsulas Medikinet® XL
- `equasym.jpg` ou `equasym.png` - Cápsulas Equasym® XL
- `concerta.jpg` o `concerta.png` - Comprimidos Concerta® XL
- `elvanse.jpg` o `elvanse.png` - Cápsulas Elvanse®

## Especificaciones técnicas:

- **Formato**: JPG o PNG (PNG preferible para transparencia)
- **Tamaño recomendado**: 200x200 px a 400x400 px
- **Peso**: < 100KB por imagen
- **Fondo**: Preferiblemente fondo blanco o transparente

## Una vez tengas las imágenes:

1. Colócalas en `/home/arkantu/docker/adhd-stimulants-pk/images/`
2. Ejecuta: `docker compose down && docker compose build && docker compose up -d`
3. Las imágenes aparecerán automáticamente en las tarjetas

## Nota legal:

Asegúrate de que el uso de las imágenes cumple con:
- Derechos de autor
- Uso educativo/informativo
- Normativa de publicidad de medicamentos
