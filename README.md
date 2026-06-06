# 🏛️ MAMBAQ — Museo de Arte Moderno de Barranquilla

Plataforma web interactiva que permite a los visitantes del museo transformar sus fotografías en obras de arte digital usando efectos artísticos en tiempo real, con detección de edad mediante Machine Learning.

🔗 **Sitio:** [www.mambaqsite.online](https://www.mambaqsite.online)  
📚 **Documentación:** [gentle-pebble-0aae24e10.7.azurestaticapps.net](https://gentle-pebble-0aae24e10.7.azurestaticapps.net)

---

## 🎨 Funcionalidades

- **Detección de edad con IA** — Teachable Machine detecta si el visitante es adulto o niño y lo redirige a la experiencia correspondiente
- **Efectos artísticos** — Pixel Art, Blanco y Negro, Óleo y Soplo aplicados en tiempo real con Canvas API
- **Captura de imagen** — Webcam en tiempo real o subida de archivo local
- **Galería colaborativa** — Las obras se guardan en Supabase con sistema de likes y vistas
- **Dos experiencias** — Versión para adultos (`adultos.html`) y versión para niños (`kids.html`)

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|-----------|
| Frontend | HTML5, CSS3, JavaScript Vanilla |
| Efectos visuales | Canvas API |
| Machine Learning | Teachable Machine + TensorFlow.js |
| Base de datos | Supabase |
| Almacenamiento | Supabase Storage |
| Hosting sitio | Azure Storage Account + Render |
| Hosting docs | Azure Static Web Apps |
| Dominio | Namecheap (`mambaqsite.online`) |
| Control de versiones | GitHub |

---

## 📁 Estructura del Proyecto

```
MAMBAQ/
├── index.html          # Página principal del museo
├── adultos.html        # Experiencia artística para adultos
├── kids.html           # Experiencia para niños
├── museo.html          # Página del museo
├── main.js             # Lógica principal del sistema
├── styles.css          # Estilos globales
├── docs/               # Documentación en Docusaurus
├── src/                # Componentes del sitio de documentación
└── static/             # Recursos estáticos
```

---

## 🚀 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/yefrey27/MAMBAQ.git
cd MAMBAQ

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El sitio de documentación estará disponible en `http://localhost:3000`.

---

## ☁️ Despliegue

### Sitio del Museo
- Alojado en **Azure Storage Account** (`mambaqsite2026`)
- Dominio personalizado: `www.mambaqsite.online`
- Configurado con Static Website habilitado

### Documentación
- Alojada en **Azure Static Web Apps**
- Conectada al repositorio de GitHub (auto-deploy en cada push)
- URL: `gentle-pebble-0aae24e10.7.azurestaticapps.net`

---

## 👥 Equipo

| Integrante | Rol |
|-----------|-----|
| Yefrey Navarro | Desarrollador Frontend / Líder |
| Roberto De La Hoz | Desarrollador |
| Carlos Ovalle | Desarrollador |

---

## 🏫 Información Académica

- **Universidad:** Universidad Simón Bolívar
- **Proyecto:** MAMBAQ — Museo de Arte Moderno de Barranquilla
- **Año:** 2026
