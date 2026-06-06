---
sidebar_position: 3
---

# Funcionalidades

## 1. Captura de Imagen

El sistema ofrece dos formas de ingresar una imagen:

### Cámara Web
- Accede a la cámara del dispositivo mediante `getUserMedia`
- Muestra un preview en tiempo real
- El usuario puede tomar la foto cuando desee
- Compatible con computadores y dispositivos móviles

### Subir Archivo
- Acepta imágenes en formato JPG, PNG, WebP
- Carga instantánea con `FileReader`
- La imagen queda lista para aplicar efectos

---

## 2. Efectos Artísticos

Todos los efectos se aplican sobre un `<canvas>` HTML usando manipulación directa de píxeles.

### 🟫 Pixel Art
Reduce la resolución de la imagen y amplía los bloques de píxeles para crear el estilo retro de arte pixelado.

```
Tamaño de bloque: configurable
Proceso: muestreo → escalado
```

### ⬛ Blanco y Negro
Convierte la imagen a escala de grises con ajuste de contraste y saturación para un resultado más expresivo.

```
Fórmula: luminancia = 0.299R + 0.587G + 0.114B
Post-proceso: mejora de contraste automática
```

### 🎨 Óleo
Simula la textura de una pintura al óleo mediante análisis de vecindad de píxeles e intensidades.

```
Radio de pincel: ajustable
Proceso: análisis de intensidad por zona → promedio ponderado
```

### 🖼️ Original
Muestra la imagen sin modificaciones.

---

## 3. Guardar Obra en la Galería

Cuando el usuario está satisfecho con el efecto aplicado:

1. Presiona **Guardar obra**
2. Ingresa su nombre y el título de la obra
3. La imagen se sube a **Supabase Storage**
4. Los datos se registran en la base de datos
5. La obra aparece en la galería compartida del museo

---

## 4. Galería del Museo

La galería muestra todas las obras creadas por visitantes:

- **Carrusel** con navegación por flechas
- **Contador de vistas** — se incrementa automáticamente al ver una obra
- **Sistema de likes** — cada dispositivo puede dar like una vez por obra (identificación por huella de canvas)
- **Carga dinámica** desde Supabase en tiempo real

---

## 5. Experiencia para Niños (kids.html)

Versión simplificada con:
- Interfaz más colorida y amigable
- Efectos adaptados para el público infantil
- Flujo simplificado sin opciones avanzadas

---

## 6. Página Principal (index.html)

La landing page del museo incluye:

| Sección | Contenido |
|---------|-----------|
| **Hero** | Animación de partículas + llamado a la acción |
| **Historia** | Historia del MAMBAQ |
| **Galería** | Preview de obras destacadas |
| **Colección Digital** | Acceso a la experiencia artística |
| **Visita** | Información de precios y horarios |

### Precios
| Público | Precio |
|---------|--------|
| Adultos | $8.000 COP |
| Niños menores de 12 | Gratis |

---

## 7. Detección de Edad con Machine Learning

El sistema utiliza **Teachable Machine** de Google para detectar el rostro del visitante a través de la cámara web y determinar si es adulto o niño, redirigiendo automáticamente a la experiencia correspondiente.

### Flujo de detección

```
Cámara web activa
       ↓
Modelo Teachable Machine analiza el rostro
       ↓
    ¿Adulto?
    /       \
  Sí         No
  ↓           ↓
adultos.html  kids.html
(Experiencia  (Experiencia
 completa)    para niños)
```

### Tecnología

- **Teachable Machine** (Google) — modelo de clasificación de imágenes entrenado para distinguir entre adultos y niños
- **TensorFlow.js** — ejecuta el modelo directamente en el navegador sin necesidad de servidor
- La detección ocurre en tiempo real con la cámara del dispositivo

🔗 [Ver modelo en Teachable Machine](https://teachablemachine.withgoogle.com/models/QlzV6RGVR/)

### Experiencias según edad

| Perfil | Página | Contenido |
|--------|--------|-----------|
| Adulto | `adultos.html` | Experiencia artística completa con todos los efectos |
| Niño | `kids.html` | Interfaz simplificada, juegos y efectos adaptados |

---

## 8. Identificación de Dispositivos

Para el sistema de likes sin duplicados, se usa una **huella de canvas** — una técnica que genera un identificador único por dispositivo basado en cómo el navegador renderiza gráficos, sin necesidad de cookies ni cuentas de usuario.

```javascript
function _canvas_fingerprint() {
  const c = document.createElement('canvas');
  // Renderiza texto y formas específicas
  // Extrae el hash del resultado
  // Cada dispositivo produce un hash único
}
```
