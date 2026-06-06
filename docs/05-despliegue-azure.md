---
sidebar_position: 5
---

# Despliegue en Azure

El proyecto MAMBAQ está alojado en **Microsoft Azure** usando dos servicios:

| Servicio | Uso | URL |
|---------|-----|-----|
| Azure Storage Account | Sitio principal del museo | `mambaqsite2026-secondary.z13.web.core.windows.net` |
| Azure Static Web Apps | Documentación Docusaurus | `gentle-pebble-0aae24e10.7.azurestaticapps.net` |

---

## Parte 1 — Sitio del Museo en Azure Storage

### Paso 1: Crear Storage Account

1. Inicia sesión en [portal.azure.com](https://portal.azure.com)
2. Clic en **Create a resource** → busca **Storage account**
3. Configura:
   - **Resource group**: `mambaq-rg`
   - **Storage account name**: `mambaqsite2026`
   - **Performance**: Standard
   - **Replication**: RA-GRS (Read-access geo-redundant storage)
4. Clic en **Review + Create** → **Create**

![Storage Account Overview](/img/imagenesAzure/03-azure-storage-overview.png)

### Paso 2: Habilitar Static Website

1. Abre el recurso `mambaqsite2026`
2. En el menú izquierdo busca **Static website** (dentro de Data storage)
3. Cambia a **Enabled**
4. En **Index document name** escribe: `index.html`
5. En **Error document path** escribe: `index.html`
6. Clic en **Save**
7. Azure crea automáticamente el contenedor **$web** y genera la URL del sitio

![Static Website configurado](/img/imagenesAzure/01-azure-static-website-config.png)

### Paso 3: Configurar Blob Anonymous Access

1. Ve a **Settings** → **Configuration**
2. Habilita **Blob anonymous access** → **Save**

Esto permite que los archivos del sitio sean accesibles públicamente.

![Properties Blob Service](/img/imagenesAzure/02-azure-storage-properties.png)

### Paso 4: Subir los Archivos del Museo

1. En el menú izquierdo ve a **Storage browser** → **Blob containers** → **$web**
2. Sube los archivos del proyecto:
   - `index.html`
   - `adultos.html`
   - `kids.html`
   - `main.js`
   - `styles.css`
3. El sitio queda disponible en la URL generada

### URLs del sitio

- **Primary endpoint**: `https://mambaqsite2026.z13.web.core.windows.net/`
- **Secondary endpoint**: `https://mambaqsite2026-secondary.z13.web.core.windows.net/`

---

## Parte 2 — Documentación en Azure Static Web Apps

### Paso 1: Subir código a GitHub

El código del Docusaurus se subió al repositorio:

🔗 [github.com/yefrey27/MAMBAQ](https://github.com/yefrey27/MAMBAQ)

```bash
git init
git add .
git commit -m "Documentacion MAMBAQ"
git branch -M main
git remote add origin https://github.com/yefrey27/MAMBAQ.git
git push -u origin main
```

### Paso 2: Crear Static Web App en Azure

1. En el portal de Azure → **Create a resource** → **Static Web App**
2. Configura:
   - **Resource group**: `MAMBAQ-docs_group`
   - **Name**: `MAMBAQ-docs`
   - **Plan**: Free
3. En **Deployment details** selecciona **GitHub**
4. Conecta la cuenta de GitHub y selecciona:
   - **Repository**: `MAMBAQ`
   - **Branch**: `main`
5. En **Build Details**:
   - **Build Presets**: Custom
   - **App location**: `/`
   - **Output location**: `build`
6. Clic en **Review + create** → **Create**

![Review antes de crear](/img/imagenesAzure/04-azure-docusaurus-review.png)

### Paso 3: Despliegue Automático

Azure conecta con GitHub Actions y despliega automáticamente. Cada vez que se hace un `git push` a `main`, el sitio se actualiza solo.

![Inicializando despliegue](/img/imagenesAzure/05-azure-docusaurus-deploying.png)

![MAMBAQ-docs en Azure](/img/imagenesAzure/07-azure-docusaurus-overview.png)

### Resultado final

![Docusaurus funcionando en Azure](/img/imagenesAzure/06-docusaurus-live.png)

### URL de la documentación

🔗 [gentle-pebble-0aae24e10.7.azurestaticapps.net](https://gentle-pebble-0aae24e10.7.azurestaticapps.net)
