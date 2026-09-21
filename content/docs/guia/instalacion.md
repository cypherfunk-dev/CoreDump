---
title: Instalación y despliegue
date: 2026-09-21
order: 2
abstract: Levantar CoreDump en local, compilarlo y publicarlo en Netlify, Vercel, GitHub Pages o Docker.
tags: coredump, guia, deploy
---

## Requisitos

- Node.js 22 o superior
- npm

## En local

```bash
git clone https://github.com/cypherfunk-dev/CoreDump.git
cd CoreDump
npm ci
npm run dev          # http://localhost:3000
```

Con `npm run dev:full` se levanta además el [panel de administración](/docs/guia/panel-admin) en `/admin`.

## Build

```bash
npm run build        # type-check + vite-ssg → dist/
npm run preview      # sirve dist/ en local
```

El build **prerenderiza** cada ruta a HTML (portada, cada post y doc, tags, categorías) y genera `sitemap.xml` y `rss.xml`. Si un artículo tiene el frontmatter mal (falta `title`, la fecha no es válida, la imagen no existe…) el build falla con un mensaje que indica el archivo y el campo.

::: warning Borradores
Los archivos con `draft: true` se ven en `npm run dev` (con una etiqueta "Borrador") pero **no** entran en el build.
:::

## Despliegue

| Plataforma | Cómo |
|---|---|
| **Netlify** | Conecta el repo. Build: `npm run build`, publish: `dist`. `public/_redirects` ya está incluido. |
| **Vercel** | Conecta el repo; detecta Vite. Build: `npm run build`, output: `dist`. |
| **GitHub Pages** | Workflow en `.github/workflows/pages.yml` (activar Pages → Source: GitHub Actions). |
| **Docker** | `docker compose up -d --build` — nginx sirviendo `dist/` con gzip y cache. |

Recuerda poner tu dominio en `url` dentro de `src/site.config.ts`: se usa para el sitemap, el RSS y las etiquetas `og:*`.
