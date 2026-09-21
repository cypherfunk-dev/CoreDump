/**
 * Optimiza las imágenes del sitio:
 *
 *   public/images/**  PNG/JPG → WebP (máx. 1600 px) + variantes 480/960 para srcset.
 *                     Los .webp ya existentes sin variantes también las reciben.
 *   src/assets/**     PNG/JPG → WebP (máx. 1920 px), sin variantes (banner, avatar).
 *
 * Reescribe las referencias .png/.jpg → .webp en los markdowns de content/.
 *
 *   npm run images            convierte y borra los originales
 *   npm run images -- --keep  conserva los originales
 */
import { readdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { toWebp, variantName, VARIANT_WIDTHS, MAX_WIDTH, WEBP_QUALITY } from '../../server/images.js';

const keepOriginals = process.argv.includes('--keep');
const SOURCE_EXT = /\.(png|jpe?g)$/i;
const IS_VARIANT = /-(480|960)\.webp$/i;

const imagesDir = path.resolve('./public/images');
const assetsDir = path.resolve('./src/assets');
const mdFolder = path.resolve('./content');

async function* walk(dir) {
    if (!existsSync(dir)) return;
    for (const dirent of await readdir(dir, { withFileTypes: true })) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) yield* walk(res);
        else yield res;
    }
}

const kb = async (file) => `${((await stat(file)).size / 1024).toFixed(0)} KB`;
const rel = (file) => path.relative('.', file);

/** true si el .webp de destino ya es más nuevo que el origen */
async function upToDate(src, out) {
    try {
        const [a, b] = await Promise.all([stat(src), stat(out)]);
        return b.mtimeMs >= a.mtimeMs;
    } catch {
        return false;
    }
}

let converted = 0;
let variants = 0;

// 1. Imágenes de artículos: WebP + variantes
for await (const file of walk(imagesDir)) {
    if (SOURCE_EXT.test(file)) {
        const out = file.replace(SOURCE_EXT, '.webp');
        if (!(await upToDate(file, out))) {
            const before = await kb(file);
            const { files } = await toWebp(file, out);
            console.log(`  ${rel(file)}  ${before} -> ${await kb(out)}  (+${files.length - 1} variantes)`);
            converted++;
        }
        if (!keepOriginals) await unlink(file);
    } else if (/\.webp$/i.test(file) && !IS_VARIANT.test(file)) {
        // .webp ya convertido antes: asegurar variantes
        const { width = 0 } = await sharp(file).metadata();
        for (const w of VARIANT_WIDTHS) {
            const out = variantName(file, w);
            if (width <= w || existsSync(out)) continue;
            await sharp(file).resize({ width: w }).webp({ quality: WEBP_QUALITY }).toFile(out);
            console.log(`  ${rel(out)}  (variante ${w}px)`);
            variants++;
        }
    }
}

// 2. Assets del sitio: solo WebP grande
for await (const file of walk(assetsDir)) {
    if (!SOURCE_EXT.test(file)) continue;
    const out = file.replace(SOURCE_EXT, '.webp');
    if (!(await upToDate(file, out))) {
        const before = await kb(file);
        await sharp(file).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toFile(out);
        console.log(`  ${rel(file)}  ${before} -> ${await kb(out)}`);
        converted++;
    }
    if (!keepOriginals) await unlink(file);
}

// 3. Referencias en los markdowns: /images/x/foo.png -> /images/x/foo.webp
let rewritten = 0;
for await (const file of walk(mdFolder)) {
    if (!file.endsWith('.md')) continue;
    const original = await readFile(file, 'utf8');
    const updated = original.replace(/(\/images\/[^\s)"']+?)\.(png|jpe?g)\b/gi, '$1.webp');
    if (updated !== original) {
        await writeFile(file, updated);
        rewritten++;
    }
}

console.log(`${converted} imágenes convertidas, ${variants} variantes añadidas, ${rewritten} markdowns actualizados (máx. ${MAX_WIDTH}px).`);
