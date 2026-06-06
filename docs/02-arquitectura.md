---
sidebar_position: 2
---

# Arquitectura del Proyecto

## Estructura de Archivos

```
MAMBAQ/
├── index.html       # Página principal del museo
├── adultos.html     # Experiencia artística para adultos
├── kids.html        # Experiencia para niños
├── main.js          # Toda la lógica del sistema
└── styles.css       # Estilos globales
```

## Arquitectura General

El proyecto sigue una arquitectura **modular por namespaces** dentro de un único archivo JavaScript (`main.js`). Cada módulo tiene una responsabilidad clara y se comunica con los demás a través del objeto global `AppState`.

```
┌─────────────────────────────────────────┐
│              NAVEGADOR                  │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │index.html│  │adultos   │  │kids   │ │
│  │          │  │.html     │  │.html  │ │
│  └────┬─────┘  └────┬─────┘  └───┬───┘ │
│       └─────────────┴────────────┘     │
│                     │                  │
│              ┌──────▼──────┐           │
│              │   main.js   │           │
│              │             │           │
│   ┌──────────┴──────────┐  │           │
│   │  Módulos internos   │  │           │
│   │  DB_ CAM_ FX_ UI_   │  │           │
│   └──────────┬──────────┘  │           │
│              └──────┬──────┘           │
└─────────────────────┼──────────────────┘
                      │
        ┌─────────────▼─────────────┐
        │         SUPABASE          │
        │  - Almacenamiento imágenes│
        │  - Base de datos obras    │
        │  - Likes y vistas         │
        └───────────────────────────┘
```

## Módulos de main.js

### DB_ — Base de Datos
Maneja toda la comunicación con Supabase.

| Función | Descripción |
|---------|-------------|
| `DB_init()` | Inicializa la conexión con Supabase |
| `DB_uploadImage(blob, fileName)` | Sube una imagen al bucket de almacenamiento |
| `DB_saveArtwork({nombre, autor, url})` | Guarda una obra en la base de datos |
| `DB_getArtworks()` | Obtiene todas las obras guardadas |
| `DB_incrementVistas(id)` | Suma una vista a una obra |
| `DB_addLike(id, delta)` | Agrega o quita un like |
| `DB_hasLiked(obraId)` | Verifica si el dispositivo ya dio like |

### FX_ — Efectos Artísticos
Aplica transformaciones visuales usando Canvas API.

| Función | Efecto |
|---------|--------|
| `FX_applyEffect(src, dst, 'pixel')` | Pixelado artístico |
| `FX_applyEffect(src, dst, 'bn')` | Blanco y negro con contraste |
| `FX_applyEffect(src, dst, 'oleo')` | Simulación de pintura al óleo |
| `FX_applyEffect(src, dst, 'soplo')` | Efecto de desenfoque artístico |
| `FX_applyEffect(src, dst, 'original')` | Sin efecto (imagen original) |

### CAM_ — Cámara y Captura
Gestiona la entrada de imágenes.

| Función | Descripción |
|---------|-------------|
| `CAM_init(refs)` | Inicializa referencias del DOM |
| `CAM_openCamera()` | Abre la cámara web del dispositivo |
| `CAM_openUpload()` | Abre el selector de archivos |
| `CAM_stopCamera()` | Detiene el stream de la cámara |
| `CAM_getOriginal()` | Retorna el canvas con la imagen capturada |

### UI_ — Interfaz de Usuario
Controla la navegación y estados visuales.

| Función | Descripción |
|---------|-------------|
| `UI_init()` | Inicializa todos los controles |
| `UI_navigateTo(id)` | Navega entre secciones |
| `UI_toast(msg, type)` | Muestra notificaciones |
| `UI_hideSplash()` | Oculta la pantalla de carga inicial |

### PARTICLES_
Animación de partículas del hero de `index.html`.

## Estado Global

`AppState` centraliza el estado de la aplicación:

```javascript
const AppState = {
  currentEffect: 'pixel',  // Efecto activo
  isProcessing: false,      // Si hay un efecto en proceso
  savedArtwork: null,       // Obra guardada actualmente
};
```

## Base de Datos Supabase

### Tabla `artworks`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | Identificador único |
| `nombre` | text | Nombre de la obra |
| `autor` | text | Nombre del autor |
| `url_imagen` | text | URL pública en el bucket |
| `likes` | int | Contador de likes |
| `vistas` | int | Contador de vistas |
| `created_at` | timestamp | Fecha de creación |

### Bucket de Almacenamiento

Las imágenes se guardan en el bucket `pixel-artworks` de Supabase Storage con acceso público para visualización en la galería.
