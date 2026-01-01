# Coredump

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

### 🖼️ Miniaturas (pendiente)

Falta implementar un script que:

* Analice las imágenes de los artículos
* Genere miniaturas automáticamente

### 🧹 Normalización de slugs (pendiente)

Falta un script que:

* Corrija nombres de archivos Markdown
* Elimine o transforme caracteres conflictivos
* Garantice slugs seguros para URLs y router

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

### 🖼️ Imágenes y SEO

El script de imágenes debe:

* Generar miniaturas automáticamente
* Convertir o validar formato **`.webp`**
* Optimizar peso y dimensiones
* Asegurar `alt` text desde frontmatter

Todo enfocado a SEO para sitios solo frontend.

---

## ⚙️ Código y estructura (pendiente)

* Revisar y optimizar el código del index
* Mejorar estructura y rendimiento
* Refactor necesario: código generado por Claude sin auditoría

---

## 📄 Secciones faltantes

* Página **About / About Us**
* Metadata SEO para páginas estáticas

---

> Coredump: cuando todo falla, pero al menos queda un log legible.
