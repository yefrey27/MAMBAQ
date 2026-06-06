---
sidebar_position: 6
---

# Despliegue y Configuración del Dominio

## 1. Compra del Dominio

- Entramos a [namecheap.com](https://namecheap.com)
- Buscamos `mambaqsite.online`
- Lo compramos por aproximadamente $4.300 COP

---

## 2. Subida del Proyecto a GitHub

- El repositorio está en [github.com/yefrey27/MAMBAQ](https://github.com/yefrey27/MAMBAQ)
- Todos los integrantes del grupo aparecen como contribuidores

---

## 3. Despliegue en Render

- Entramos a [render.com](https://render.com)
- Clic en **New + → Static Site**
- Conectamos la cuenta de GitHub

![Repositorios GitHub en Render](/img/imgDespliegueDominio/03-render-repositorios-github.jpeg)

- Seleccionamos el repositorio `MAMBAQ`
- Configuración:

```
Name:              mambaq
Branch:            main
Build command:     npm install; npm run build
Publish directory: .
```

![Build en proceso](/img/imgDespliegueDominio/04-render-building.jpeg)

- Render desplegó el sitio automáticamente en:

```
https://mambaq-auu4.onrender.com
```

---

## 4. Conexión del Dominio en Render

- Dentro del sitio en Render fuimos a **Settings → Custom Domains → Add Custom Domain**
- Escribimos `mambaqsite.online`

![Custom Domains en Render](/img/imgDespliegueDominio/05-render-custom-domains.jpeg)

![Agregar dominio mambaqsite.online](/img/imgDespliegueDominio/06-render-add-domain.jpeg)

- Render nos dio estos valores DNS:

```
www  →  mambaq-auu4.onrender.com
@    →  216.24.57.1
```

---

## 5. Configuración DNS en Namecheap

- Entramos a **Domain List → Manage → Advanced DNS**
- Agregamos dos registros:

**Registro 1:**
```
Type:  CNAME Record
Host:  www
Value: mambaq-auu4.onrender.com
TTL:   Automatic
```

**Registro 2:**
```
Type:  A Record
Host:  @
Value: 216.24.57.1
TTL:   Automatic
```

![Registros DNS en Namecheap](/img/imgDespliegueDominio/07-namecheap-dns-records.jpeg)

---

## 6. Resultado Final

El sitio quedó disponible en:

🔗 [www.mambaqsite.online](https://www.mambaqsite.online)

- ✅ HTTPS activado automáticamente por Render
- ✅ Dominio propio conectado
- ✅ Proyecto desplegado en producción
