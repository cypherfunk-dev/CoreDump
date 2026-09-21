---
title: Escribir posts y docs
date: 2026-09-21
order: 3
abstract: Frontmatter, sintaxis Markdown soportada (código, fórmulas, admonitions) y cómo se generan las URLs.
tags: coredump, guia, markdown
---

## Frontmatter

```yaml
---
title: Cómo arreglar lo que rompió el último Windows Update   # obligatorio
date: 2026-05-01                                             # obligatorio (YYYY-MM-DD)
category: Software
tags: windows, update, soporte
author: Soporte mental
abstract: Resumen corto que se muestra en portada, búsqueda y RSS.
image: /images/2026/windows-update.webp                     # debe existir en public/
draft: false        # true → solo visible en dev
comments: true      # false → sin giscus en este artículo
slug: windows-update-roto   # opcional; por defecto se toma del nombre del archivo
order: 2            # solo docs: orden dentro de su sección
---
```

## URLs

| Archivo | URL |
|---|---|
| `content/posts/2026/mi-post.md` | `/articles/2026/mi-post` |
| `content/docs/guia/index.md` | `/docs/guia` (título y orden de la sección) |
| `content/docs/guia/instalacion.md` | `/docs/guia/instalacion` |

Los nombres de archivo se normalizan (minúsculas, sin acentos, guiones). Aun así, conviene nombrarlos ya limpios: la URL es la clave de los comentarios.

## Markdown soportado

### Código con resaltado

````markdown
```powershell
Get-Service | Where-Object Status -eq 'Running'
```
````

```powershell
Get-Service | Where-Object Status -eq 'Running'
```

### Fórmulas (KaTeX)

Inline `$\Delta t \approx 0$` → $\Delta t \approx 0$, o en bloque:

$$
\text{latencia} = \frac{\text{distancia}}{c} + t_{\text{codificación}}
$$

### Admonitions

```markdown
::: tip Título opcional
Contenido.
:::
```

Tipos: `tip`, `info`, `warning`, `danger` y `details` (colapsable).

::: info
Los títulos `##` y `###` generan anclas y la tabla de contenidos lateral.
:::

::: details ¿Y HTML embebido?
Desactivado por defecto (`markdown.allowHtml: false` en `site.config.ts`) para evitar XSS si aceptas contenido de terceros.
:::

### Imágenes

```markdown
![Texto alternativo](/images/2026/captura.webp)
```

Se cargan con `loading="lazy"`. Ejecuta `npm run images` para convertir PNG/JPG a WebP (reescribe las referencias automáticamente).
