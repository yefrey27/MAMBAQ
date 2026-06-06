---
sidebar_position: 1
---

# Introducción

## ¿Qué es MAMBAQ?

**MAMBAQ** (Museo de Arte Moderno de Barranquilla) es una plataforma web interactiva que permite a los visitantes del museo transformar sus fotografías en obras de arte digital. El proyecto fue desarrollado como aplicación web usando tecnologías nativas del navegador — sin frameworks adicionales — y está desplegado en **Microsoft Azure**.

## Objetivo del Proyecto

Crear una experiencia digital inmersiva donde cualquier persona pueda:

1. Capturar una foto con su cámara o subir una imagen
2. Aplicarle un efecto artístico (Pixel Art, Blanco y Negro, Óleo, Soplo)
3. Guardar su obra en la galería del museo
4. Interactuar con otras obras mediante likes y vistas

## Páginas del Sitio

| Página | Descripción |
|--------|-------------|
| `index.html` | Página principal del museo con historia, galería y colección |
| `adultos.html` | Experiencia artística completa para adultos |
| `kids.html` | Versión adaptada para niños con interfaz simplificada |

## Tecnologías Utilizadas

- **HTML5 / CSS3 / JavaScript** — Sin frameworks, tecnología web pura
- **Canvas API** — Para la aplicación de efectos artísticos en tiempo real
- **Teachable Machine + TensorFlow.js** — Detección de edad mediante Machine Learning para redirigir entre la experiencia de adultos y niños
- **Supabase** — Base de datos y almacenamiento en la nube para obras guardadas
- **Microsoft Azure** — Hosting del sitio en Azure Static Web Apps

## Equipo

| Integrante | Rol |
|-----------|-----|
| Yefrey Navarro | Desarrollador Frontend / Líder del proyecto |
| Roberto De La Hoz | Desarrollador |
| Carlos Ovalle | Desarrollador |

## Sitio en Producción

El sitio está desplegado en Azure y se puede visitar en:

🔗 [mambaqsite2026-secondary.z13.web.core.windows.net](https://mambaqsite2026-secondary.z13.web.core.windows.net/index.html)
