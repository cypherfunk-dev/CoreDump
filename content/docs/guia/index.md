---
title: Guía de CoreDump
date: 2026-09-21
order: 1
abstract: Cómo funciona CoreDump y cómo publicar posts y documentación con solo archivos Markdown.
tags: coredump, guia
---

CoreDump es un blog + documentación **100 % estático**: el contenido son archivos Markdown en `content/`, el build (Vite) los convierte en HTML prerenderizado con búsqueda, RSS y sitemap, y el resultado se sirve desde cualquier hosting estático (Netlify, Vercel, GitHub Pages, un nginx en Docker…).

::: tip Sin backend
No hay base de datos ni servidor de aplicaciones. Todo lo que necesita un artículo para existir es un `.md` commiteado en el repo.
:::

## Estructura

```text
content/
├── posts/            # blog: se ordena por fecha y aparece en la portada
│   └── 2026/
│       └── mi-post.md          →  /articles/2026/mi-post
└── docs/             # documentación: se organiza en árbol por carpeta
    └── guia/
        ├── index.md            →  /docs/guia
        └── instalacion.md      →  /docs/guia/instalacion
public/images/        # imágenes referenciadas desde el frontmatter y el cuerpo
src/site.config.ts    # nombre, autor, URL, slogans, comentarios…
```

## Las tres cosas que tocarás

1. **`src/site.config.ts`** — nombre del sitio, descripción, URL pública, autor y redes, slogans, tema de código, giscus.
2. **`content/`** — tus posts y docs.
3. **`public/images/`** — las imágenes (conviene pasarlas por `npm run images`, que las convierte a WebP).

Todo lo demás es el motor y no hace falta tocarlo.
