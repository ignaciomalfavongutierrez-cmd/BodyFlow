# BodyFlow Nutri Design System
> **Identidad Visual & Especificación de Diseño Clínico**  
> *Nutrióloga Lic. N. Talia Tinoco Fabián — Cédula Profesional 11290678*

---

## 1. Filosofía de Diseño
El sistema de diseño clínico de **Talia Tinoco Nutrición** combina la sobriedad médica con la calidez orgánica. Utiliza una armonía de **verdes salvia, olivas profundos, beiges cálidos y blancos puros** para transmitir salud, confianza, naturalidad y orden profesional.

Diseñado específicamente para generar **documentos clínicos de 1 sola página en formato Carta (Letter 8.5" × 11") / A4**, óptimos tanto para impresión física como para visualización digital en dispositivos móviles (WhatsApp / PDF / Correo).

---

## 2. Paleta de Colores Oficial

### 🎨 Colores Principales (Brand Tokens)

| Token | Hex | Muestra | Nombre | Uso Principal |
| :--- | :--- | :---: | :--- | :--- |
| `--nutri-primary` | `#556637` | 🟩 | **Sage Dark / Verde Oliva Clínico** | Títulos principales, logotipo, bordes de acento, nombres y encabezados de cédula. |
| `--nutri-primary-dark` | `#3b4625` | 🌲 | **Oliva Profundo** | Títulos de banners, números destacados y texto de máxima jerarquía. |
| `--nutri-secondary` | `#7e9455` | 🍏 | **Verde Manzana / Sage Vivo** | Íconos, viñetas de listas, badges de categoría y botones de acción principal. |
| `--nutri-accent` | `#8c9b74` | 🫒 | **Salvia Medio** | Subtítulos de marca, líneas divisorias secundarias y etiquetas de resumen. |
| `--nutri-accent-light` | `#9eb07a` | 🍃 | **Verde Hoja Suave** | Acentos del isotipo de la manzana, cintas métricas y detalles visuales. |

### 📄 Superficies y Fondos

| Token | Hex | Nombre | Uso Principal |
| :--- | :--- | :--- | :--- |
| `--nutri-surface` | `#ffffff` | **Blanco Puro Clínico** | Fondo de tarjetas de recomendación, cabecera y cuerpo de tabla. |
| `--nutri-surface-alt` | `#f4f7ee` | **Crema Salvia Muy Claro** | Fondo de tarjeta de contacto, badges de objetivo y notas médicas. |
| `--nutri-page-bg` | `#fafbf7` | **Marfil Clínico** | Fondo general de la hoja de recomendaciones e informes. |
| `--nutri-banner-soft` | `#d7dac3` | **Beige Salvia Atenuado** | Fondo del banner central "Recomendaciones". |
| `--nutri-patient-bar` | `#eef3e5` | **Menta Pastel Suave** | Barra de metadatos de paciente, fecha y objetivo. |

### 🔤 Tipografía y Textos

| Token | Hex | Nombre | Uso Principal |
| :--- | :--- | :--- | :--- |
| `--nutri-text-main` | `#2b351e` | **Verde Muy Oscuro / Casi Negro** | Textos principales, títulos de viñetas en negrita y nombres. |
| `--nutri-text-body` | `#364028` | **Oliva Oscuro de Lectura** | Párrafos descriptivos, explicaciones de viñetas y lineamientos. |
| `--nutri-text-muted` | `#5e6950` | **Salvia Atenuado** | Subtítulos, metadatos secundarios y etiquetas informativas. |
| `--nutri-text-light` | `#8fa074` | **Salvia Claro** | Placeholders de entrada e interletreados decorativos. |

### 🔲 Bordes y Separadores

| Token | Hex | Nombre | Uso Principal |
| :--- | :--- | :--- | :--- |
| `--nutri-border` | `#cad7b7` | **Borde Salvia Estándar** | Bordes de tarjetas, separadores de sección y cajas de cédula. |
| `--nutri-border-card` | `#d3dec3` | **Borde Suave de Tarjetas** | Contorno de las 6 tarjetas de recomendaciones. |
| `--nutri-border-highlight`| `#9fb084`| **Borde de Énfasis** | Borde de tarjetas destacadas o notas médicas específicas. |

---

## 3. Tipografía

### Familias Tipográficas
1. **Titulares y Marca**: `'Outfit', 'Montserrat', sans-serif`
2. **Cuerpo y Listas**: `'Inter', 'Montserrat', -apple-system, sans-serif`

### Escala Tipográfica (Optimizada para 1 Página Carta)

```css
--text-brand-title: 13.5px / font-weight: 800 / letter-spacing: 0.6px
--text-brand-sub:   9.5px  / font-weight: 600 / letter-spacing: 2.0px
--text-banner-main: 14.0px / font-weight: 800 / letter-spacing: 1.4px
--text-card-title:  10.5px / font-weight: 700 / letter-spacing: 0.3px
--text-card-body:    9.0px / font-weight: 400 / line-height: 1.35
--text-contact:      8.8px / font-weight: 500 / line-height: 1.30
--text-cedula:      12.5px / font-weight: 800 / letter-spacing: 0.4px
```

---

## 4. Estructura y Anatomía de Componentes

### 1. Cabecera Clínica (`.sheet-header`)
- **Izquierda**: Isotipo SVG de la Manzana con Cinta Métrica + Nombre "TALIA TINOCO FABIÁN - NUTRICIÓN CLÍNICA".
- **Centro**: Banner institucional con fondo `--nutri-banner-soft` (#d7dac3) y título en mayúsculas "RECOMENDACIONES".
- **Derecha**: Recuadro de Cédula Profesional `11290678`.

### 2. Barra de Metadatos (`.patient-bar`)
- Fondo `--nutri-patient-bar` (#eef3e5).
- Campo de Paciente (con soporte para entrada interactiva o impresión estática), Fecha formateada en español y Badge de Objetivo Nutricional.

### 3. Grid de Recomendaciones 2x3 Simétrico (`.recom-grid`)
- **Distribución**: 2 columnas × 3 filas con `grid-auto-rows: 1fr` y `height: 100%`.
- **Estructura Interna de Tarjeta**:
  - Badge circular con ícono temático (Horarios, Calidad, Verduras, Hidratación, Composición, Ejercicio).
  - Título numerado en mayúsculas.
  - Lista de viñetas con viñeta verde esmeralda y distribución vertical uniforme.

### 4. Barra de Compromiso y Resumen (`.summary-bar`)
- Recuadro con ícono de brote verde (`fa-seedling`), frase motivacional adaptativa según el objetivo nutricional y etiqueta de estilo de vida.

### 5. Pie de Página de Contacto (`.sheet-footer`)
- Tarjeta de contacto dividida en 2 columnas:
  - Nombre y Cédula Profesional.
  - Dirección del Consultorio.
  - Teléfono directo (`3541009737`) y Correo electrónico (`lic.n.talia@gmail.com`).
- Logotipo de nutrición con isotipo y firma.

---

## 5. Especificaciones de Impresión y Exportación PDF (1 Página)

```css
@page {
  size: letter portrait;
  margin: 4mm;
}

@media print {
  body {
    background: #ffffff !important;
  }
  .sheet-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: none !important;
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
}
```
- **Proporción de Lienzo**: 850px de ancho para resolución digital nítida.
- **Relación de Aspecto**: 1:1.294 (Carta estándar), garantizando que todo el contenido quepa en **1 sola página sin desbordamientos**.
