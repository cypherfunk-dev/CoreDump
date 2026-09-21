# CoreDump

![Logo CoreDump](/avatar.png)

[coredumpmd.netlify.app](https://coredumpmd.netlify.app)

Blog técnico + documentación **100 % estático**: escribes Markdown en `content/`, el build lo convierte en HTML prerenderizado con búsqueda full-text, RSS, sitemap y PWA, y lo sirves desde cualquier hosting estático. Sin backend, sin base de datos.

> Coredump: cuando todo falla, pero al menos queda un log legible.

## Úsalo para tu propio sitio

1. **Use this template** (o fork) → clona → `npm ci`.
2. Edita **`src/site.config.ts`**: nombre, descripción, URL pública, autor y redes, slogans, color de acento.
3. Borra los posts de ejemplo en `content/posts/` y escribe los tuyos. Adapta `content/pages/about.md` (la carpeta `content/docs/guia/` es el manual de CoreDump: puedes dejarla, adaptarla o borrarla).
4. Sustituye `src/assets/avatar.webp`, `src/assets/banner.webp` y los favicons de `public/`.
5. Despliega (ver abajo).

Eso es todo lo que hay que tocar. El resto (`src/`, `build/`, `server/`) es el motor.

## Cómo funciona

```
content/
├── posts/2026/mi-post.md        →  /articles/2026/mi-post   (blog, ordenado por fecha)
└── docs/guia/
    ├── index.md                 →  /docs/guia               (título/orden de la sección)
    └── instalacion.md           →  /docs/guia/instalacion   (árbol lateral, prev/next)
└── pages/about.md               →  /about                   (páginas sueltas; enlaces en site.config `nav`)
public/images/                   →  imágenes (npm run images las pasa a WebP + variantes 480/960 para srcset)
src/site.config.ts               →  configuración del sitio
```

En el build, `build/plugin.ts` lee `content/`, valida el frontmatter con zod (si falta `title`, la fecha es inválida o la imagen no existe, **el build falla diciendo archivo y campo**), renderiza el Markdown con shiki + KaTeX + admonitions + TOC, serializa un índice MiniSearch con el **cuerpo completo** de cada artículo y genera `sitemap.xml` y `rss.xml`. Después `vite-ssg` prerenderiza cada ruta a HTML.

### Frontmatter

```yaml
---
title: Título                # obligatorio
date: 2026-05-01             # obligatorio
category: Software
tags: windows, soporte
author: Nombre
abstract: Resumen para portada, búsqueda y RSS.
image: /images/2026/foto.webp
draft: false                 # true → solo en dev
comments: true               # false → sin giscus
slug: url-personalizada      # opcional
order: 2                     # solo docs
---
```

Markdown soportado: código con resaltado (shiki, tema claro/oscuro), `$fórmulas$` (KaTeX), `::: tip|info|warning|danger|details`, tablas, imágenes lazy, anclas en títulos. Todo documentado en `/docs/guia/escribir`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Vite en `http://localhost:3000` (los borradores se ven) |
| `npm run dev:full` | Vite + [panel de administración](#panel-de-administración) en `/admin` |
| `npm run build` | Type-check + `vite-ssg build` → `dist/` |
| `npm run preview` | Sirve `dist/` |
| `npm run images` | PNG/JPG → WebP (+ variantes 480/960 para `srcset`) y reescribe las referencias |
| `npm run lint` / `npm test` | ESLint / Vitest (pipeline de contenido) |

## Panel de administración

`npm run dev:full` → `http://localhost:3000/admin` (`admin` / `coredump`; variables `ADMIN_USER`, `ADMIN_PASS`). Crear, **editar y borrar** artículos con preview, frontmatter generado, borrador/comentarios, subida de imágenes y **pegado desde el portapapeles** (todo convertido a WebP con variantes). Escribe directamente en `content/` y `public/images/`; después commiteas. Solo existe en dev: `/admin` se excluye del build y el servidor solo escucha en `127.0.0.1`.

**Sin Node:** edita los `.md` desde la web de GitHub. El workflow `ci.yml` valida el contenido y `images.yml` convierte a WebP las imágenes que subas.

## Despliegue

| Plataforma | Cómo |
|---|---|
| **Netlify** | Conecta el repo; `netlify.toml` y `public/_redirects` ya están. |
| **Vercel** | Conecta el repo; `vercel.json` ya está. |
| **GitHub Pages** | Settings → Pages → Source: *GitHub Actions* (`.github/workflows/pages.yml`). En subruta, variable `BASE_PATH=/repo/`. |
| **Docker** | `docker compose up -d --build` — nginx con gzip, cache y 404 estático (`nginx.conf`). |

Pon tu dominio en `url` dentro de `site.config.ts` (sitemap, RSS, canonical y `og:*` dependen de él).

## Comentarios (giscus)

Requiere repo **público** con Discussions. Instala [la app de giscus](https://github.com/apps/giscus), obtén los IDs en [giscus.app](https://giscus.app) y rellena `comments` en `site.config.ts` con `enabled: true`. `comments: false` en un artículo lo desactiva ahí.

## Analítica (opcional)

`analytics` en `site.config.ts`: `{ provider: 'plausible', domain: '...' }` o `{ provider: 'umami', websiteId: '...' }`. Sin cookies, sin banner. Por defecto `none`.

## Stack

Vue 3 · Vuetify 3 · Vite 7 · vite-ssg · unplugin-vue-router · Pinia · MiniSearch · markdown-it + shiki + KaTeX · zod · vite-plugin-pwa · TypeScript.

## Ideas futuras

- Varios autores (`content/authors/*.md`) con página propia
- Búsqueda con atajo de teclado (`/` o `Ctrl+K`)
- i18n de contenido (varios idiomas por artículo)
