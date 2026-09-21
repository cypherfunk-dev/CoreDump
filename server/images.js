/**
 * Conversión de imágenes a WebP con variantes responsive.
 * Lo usan `npm run images` (src/scripts/optimize-images.js) y el servidor admin.
 *
 *   foo.png  →  foo.webp (máx. MAX_WIDTH) + foo-480.webp + foo-960.webp
 *
 * El build (build/content.ts) detecta las variantes que existan y genera el
 * `srcset`; si no existen, simplemente usa foo.webp.
 */
import sharp from 'sharp';
import path from 'node:path';
import { stat } from 'node:fs/promises';

export const MAX_WIDTH = 1600;
export const VARIANT_WIDTHS = [480, 960];
export const WEBP_QUALITY = 82;

/** Nombre de la variante: foo.webp + 480 → foo-480.webp */
export const variantName = (webpFile, width) => webpFile.replace(/\.webp$/i, `-${width}.webp`);

/**
 * @param {string | Buffer} input  ruta o buffer de la imagen original
 * @param {string} outFile         ruta del .webp principal a escribir
 * @returns {Promise<{ width: number, files: string[] }>}
 */
export async function toWebp(input, outFile) {
  const image = sharp(input);
  const { width = MAX_WIDTH } = await image.metadata();
  const files = [];

  await image.clone().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toFile(outFile);
  files.push(outFile);

  for (const w of VARIANT_WIDTHS) {
    if (width <= w) continue; // no tiene sentido una variante más grande que el original
    const out = variantName(outFile, w);
    await image.clone().resize({ width: w }).webp({ quality: WEBP_QUALITY }).toFile(out);
    files.push(out);
  }
  return { width: Math.min(width, MAX_WIDTH), files };
}

export const fileSize = async (file) => (await stat(file)).size;
export const relative = (file) => path.relative(process.cwd(), file);
