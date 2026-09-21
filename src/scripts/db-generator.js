import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const dbRoute = path.resolve('./src/database/db.json');
const mdFolder = path.resolve('./public/markdowns');

/**
 * Recorre un directorio de forma recursiva y devuelve todos los archivos .md.
 * @param {string} dir
 * @returns {AsyncGenerator<string>}
 */
async function* getMarkdownFiles(dir) {
    for (const dirent of await readdir(dir, { withFileTypes: true })) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) yield* getMarkdownFiles(res);
        else if (dirent.name.endsWith('.md')) yield res;
    }
}

console.log(`Scanning directory: ${mdFolder}`);

const articles = [];
for await (const file of getMarkdownFiles(mdFolder)) {
    const year = path.basename(path.dirname(file));
    const slug = path.basename(file, '.md');
    const { data } = matter.read(file);

    if (!data.title || !data.date) {
        console.warn(`  ! ${year}/${slug}.md sin title/date en el frontmatter, se omite`);
        continue;
    }
    articles.push({ slug: `/articles/${year}/${slug}`, metadata: data });
}

// Más reciente primero; el id se asigna tras ordenar para que sea estable.
articles.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));
const db = articles.map((a, i) => ({ id: String(i), ...a }));

await writeFile(dbRoute, JSON.stringify(db, null, 2) + '\n');
console.log(`  ${db.length} artículos -> ${dbRoute}`);
