# Coredump

![Logo CoreDump](/avatar.png )

[CoreDump.md](https://coredumpmd.netlify.app "El vínculo al sitio")


Blog técnico minimalista hecho con **Vue** que consume y renderiza archivos **Markdown**. No hay backend, no hay base de datos, no hay magia oscura. Solo archivos, frontend y algo de disciplina.

---

## 🧠 Idea

Coredump es un blog/documentación orientado a contenido técnico, donde:

* El contenido vive en archivos `.md`
* Todo se versiona con Git
* El frontend es el único responsable de mostrar y buscar información

---

## 🛠️ Stack

* **Vue** (frontend)
* **Markdown** como fuente de contenido
* **Frontmatter** para metadata
* **MiniSearch** para búsqueda y búsqueda avanzada
* **JSON** generado automáticamente como índice de artículos

Sin backend. Sin base de datos. 

---

## 🔎 Búsqueda

El frontend implementa:

* Búsqueda simple
* Búsqueda avanzada

Ambas usan **MiniSearch**, alimentado por un archivo JSON que contiene la metadata de los artículos (título, tags, fecha, slug, etc.).

---

## 📁 Estructura de contenido

```
markdowns/
├── 2024/
│   ├── mi-primer-post.md
│   └── vue-notas.md
├── 2025/
│   └── arquitectura-coredump.md
```

* Cada carpeta representa un **año**
* El nombre del archivo Markdown es el **slug**
* El router de Vue se basa directamente en esta estructura

---

## ✍️ Frontmatter

Cada artículo usa frontmatter para su metadata:

```md
---
title: "Cómo configurar un servidor para que se convierta en tu nuevo mayordomo personal (y lo haga todo por ti)"
date: 2025-12-10
category: Hardware
tags: configuración, servidor, humor, tecnología_innecesaria
author: Departamento de Tecnología Absurda
abstract: Te guiamos paso a paso para configurar un servidor que no solo administre tus archivos, sino que también sea tu nuevo asistente personal, aunque no lo pidas.
image: /images/2025/seis.png
---
```

Esta información es usada tanto para renderizado como para búsqueda.

---

## ⚙️ Scripts

### 📦 Indexador de artículos

Script que:

* Analiza automáticamente `./markdowns/{año}`
* Extrae frontmatter
* Genera un archivo JSON con la metadata
* Es consumido directamente por el frontend

### 🖼️ Imágenes

`npm run images` (usa `sharp`):

* Convierte los PNG/JPG de `public/images` y `src/assets` a **WebP** (máx. 1600 px)
* Reescribe las referencias `image:` y `![]()` de los markdowns
* Borra los originales (usa `-- --keep` para conservarlos) y regenera el índice

### 🖥️ Panel de administración (solo local)

```bash
npm run dev:full   # vite (:3000) + servidor admin (:3002)
```

Abre `http://localhost:3000/admin` (usuario/clave por defecto `admin` / `coredump`, configurables con `ADMIN_USER` y `ADMIN_PASS`). Desde ahí puedes:

* Escribir el artículo con preview de Markdown y generar el frontmatter
* Subir la imagen destacada (PNG/JPG se convierten a WebP automáticamente)
* Regenerar `db.json`

El servidor (`server/admin-server.js`) escribe los archivos directamente en el repo; después solo queda commitear. La ruta `/admin` se excluye del build de producción.

### 📝 Flujo para publicar un artículo

**Con el panel:** `npm run dev:full` → `/admin` → guardar → "Reconstruir DB" → commit.

**A mano:**

```bash
# 1. Crear public/markdowns/{año}/{slug}.md con frontmatter e imagen en public/images/{año}/
npm run images   # 2. Optimiza imágenes y regenera src/database/db.json
npm run build    # 3. Type-check + build
```

### 🧹 Slugs

Los artículos creados desde el panel generan el slug a partir del título (minúsculas, sin acentos, guiones). Los archivos creados a mano usan su nombre tal cual; conviene evitar acentos, espacios y paréntesis.

---

## 🎯 Objetivos

* Contenido desacoplado del frontend
* Escritura rápida y portable
* Control total sin dependencias innecesarias

---

## 🚀 SEO y optimización (pendiente)

Al ser un sitio **100% frontend**, el SEO requiere trabajo explícito.

Pendientes principales:

* Optimización SEO para SPA
* Meta tags dinámicos (`title`, `description`, `og:*`)
* HTML semántico correcto
* Sitemap generado desde el índice JSON
* URLs limpias basadas en slugs seguros

---

## 📄 Secciones faltantes

* Página **About / About Us**
* Metadata SEO para páginas estáticas

---

> Coredump: cuando todo falla, pero al menos queda un log legible.
