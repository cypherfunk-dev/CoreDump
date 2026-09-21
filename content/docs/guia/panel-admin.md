---
title: Panel de administración
date: 2026-09-21
order: 4
abstract: Editor local con preview, subida de imágenes y generación de frontmatter. Solo en desarrollo.
tags: coredump, guia, admin
---

```bash
npm run dev:full     # vite (:3000) + servidor admin (:3002)
```

Abre `http://localhost:3000/admin`. Usuario y clave por defecto: `admin` / `coredump` (variables `ADMIN_USER` y `ADMIN_PASS`).

Desde el panel puedes:

- **Crear** un artículo con preview de Markdown y frontmatter generado.
- **Editar o borrar** los existentes (icono de lista en la barra superior). Al editar se conserva el archivo, y por tanto la URL y sus comentarios.
- **Pegar imágenes** del portapapeles directamente en el editor: se suben a `public/images/<año>/`, se convierten a WebP y se inserta el `![]()`.
- Subir la imagen destacada (PNG/JPG → WebP automáticamente).
- Marcar como **borrador** o desactivar los comentarios.

Al guardar, Vite recompila el contenido al vuelo; solo queda hacer commit.

::: danger Solo local
El servidor admin escribe archivos en el repo. No se despliega: la ruta `/admin` se excluye del build de producción y el servidor solo escucha en `127.0.0.1`.
:::

## Sin instalar Node

También puedes editar los `.md` desde la web de GitHub: el workflow de CI valida el contenido y, si subes imágenes PNG/JPG a `public/images/`, las convierte a WebP y hace commit del resultado.
