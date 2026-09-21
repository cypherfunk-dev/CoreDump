/**
 * Convierte las imágenes PNG/JPG de los artículos (public/images) y los assets
 * del sitio (src/assets) a WebP, redimensionando al ancho máximo indicado.
 * Reescribe las referencias en el frontmatter y cuerpo de los markdowns.
 *
 *   npm run images          convierte y borra los originales
 *   npm run images -- --keep  conserva los originales
 */
import { readdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const keepOriginals = process.argv.includes('--keep');
const SOURCE_EXT = /\.(png|jpe?g)$/i;

const targets = [
    { dir: path.resolve('./public/images'), maxWidth: 1600 },
    { dir: path.resolve('./src/assets'), maxWidth: 1920 },
];
const mdFolder = path.resolve('./public/markdowns');

async function* walk(dir) {
    for (const dirent of await readdir(dir, { withFileTypes: true })) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) yield* walk(res);
        else yield res;
    }
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

/** Convierte un archivo a .webp junto al original. Devuelve la ruta nueva o null si se omitió. */
async function convert(file, maxWidth) {
    const out = file.replace(SOURCE_EXT, '.webp');
    try {
        const [src, dst] = await Promise.all([stat(file), stat(out)]);
        if (dst.mtimeMs >= src.mtimeMs) return null; // ya está al día
    } catch { /* no existe el .webp todavía */ }

    const before = (await stat(file)).size;
    await sharp(file)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(out);
    const after = (await stat(out)).size;
    console.log(`  ${path.relative('.', file)}  ${kb(before)} -> ${kb(after)}`);
    return out;
}

const converted = [];
for (const { dir, maxWidth } of targets) {
    for await (const file of walk(dir)) {
        if (!SOURCE_EXT.test(file)) continue;
        const out = await convert(file, maxWidth);
        converted.push(file);
        if (!keepOriginals && out) await unlink(file);
    }
}

// Reemplaza /images/x/foo.png -> /images/x/foo.webp en los markdowns.
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

console.log(`${converted.length} imágenes procesadas, ${rewritten} markdowns actualizados.`);
