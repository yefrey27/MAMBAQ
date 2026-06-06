---
sidebar_position: 4
---

# Instalación y Despliegue

## Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Edge)
- Cuenta en [Supabase](https://supabase.com) (para la base de datos)
- Cuenta en [Microsoft Azure](https://azure.microsoft.com) (para el hosting)

## Ejecutar Localmente

El proyecto no requiere instalación de dependencias ya que usa JavaScript puro.

1. Clona el repositorio desde GitHub
2. Abre `index.html` directamente en el navegador, o usa un servidor local:

```bash
# Con Python
python -m http.server 8000

# Con Node.js (npx)
npx serve .
```

3. Abre `http://localhost:8000` en el navegador

## Configurar Supabase

En el archivo `main.js`, configura tus credenciales:

```javascript
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU_ANON_KEY';
const STORAGE_BUCKET = 'pixel-artworks';
```

### Estructura de la Base de Datos

Ejecuta este SQL en el editor de Supabase:

```sql
create table artworks (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  autor text not null,
  url_imagen text not null,
  likes int default 0,
  vistas int default 0,
  created_at timestamp default now()
);
```

### Bucket de Almacenamiento

1. Ve a **Storage** en Supabase
2. Crea un bucket llamado `pixel-artworks`
3. Habilita el acceso público
