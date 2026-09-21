/**
 * srcset para imágenes de public/images con variantes generadas por
 * `npm run images` (foo-480.webp, foo-960.webp). Ver server/images.js.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

const VARIANT_WIDTHS = [480, 960];
const MAX_WIDTH = 1600;

/** Devuelve el srcset si existen variantes de `src` (ruta pública /images/...), o undefined. */
export function srcsetFor(publicDir: string, src: string | undefined): string | undefined {
  if (!src || !src.startsWith('/') || !/\.webp$/i.test(src)) return undefined;
  const abs = path.join(publicDir, src);
  const entries = VARIANT_WIDTHS
    .map(w => ({ w, url: src.replace(/\.webp$/i, `-${w}.webp`) }))
    .filter(({ url }) => existsSync(path.join(publicDir, url)))
    .map(({ w, url }) => `${url} ${w}w`);
  if (!entries.length || !existsSync(abs)) return undefined;
  return [...entries, `${src} ${MAX_WIDTH}w`].join(', ');
}

/** `sizes` razonable para imágenes dentro del cuerpo de un artículo. */
export const BODY_SIZES = '(max-width: 960px) 100vw, 960px';
