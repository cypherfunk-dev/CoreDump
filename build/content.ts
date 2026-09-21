/**
 * Carga y valida el contenido de `content/` en el BUILD.
 *
 *   content/posts/<año>/<slug>.md      → /articles/<año>/<slug>
 *   content/docs/<sección>/<página>.md → /docs/<sección>/<página>
 *   content/docs/<sección>/index.md    → /docs/<sección>
 *   content/pages/<slug>.md            → /<slug>   (about, contacto…)
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import MiniSearch from 'minisearch';
import type { ContentMeta, ContentKind, DocNode } from '../src/content/types';
import { searchOptions, type SearchDoc } from '../src/content/search-options';
import { createRenderer, readingTime, type MarkdownOptions, type RenderResult } from './markdown';
import { srcsetFor } from './images';

export const CONTENT_DIR = 'content';

const frontmatterSchema = z.object({
  title: z.string().trim().min(1, 'title es obligatorio'),
  date: z.coerce.date({ error: 'date debe ser una fecha (YYYY-MM-DD)' }),
  category: z.string().trim().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional()
    .transform(t => (Array.isArray(t) ? t : (t ?? '').split(',')).map(s => s.trim()).filter(Boolean)),
  author: z.string().trim().optional(),
  abstract: z.string().trim().optional(),
  image: z.string().trim().optional(),
  draft: z.boolean().default(false),
  comments: z.boolean().default(true),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug solo admite a-z, 0-9 y guiones').optional(),
  order: z.number().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface ContentEntry {
  meta: ContentMeta;
  file: string;
  body: string;
}

export interface LoadOptions {
  root: string;
  includeDrafts: boolean;
  markdown: MarkdownOptions;
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`[content] ${file}: ${message}`);
  }
}

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const res = path.join(dir, dirent.name);
    if (dirent.isDirectory()) yield* walk(res);
    else if (dirent.name.endsWith('.md')) yield res;
  }
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Deriva kind, url, slug y section a partir de la ruta relativa dentro de content/. */
export function resolveLocation(relPath: string, fm: Frontmatter, file: string) {
  const segments = relPath.split(/[\\/]/);
  const top = segments[0];
  const kinds: Record<string, ContentKind> = { posts: 'post', docs: 'doc', pages: 'page' };
  const kind = kinds[top ?? ''];
  if (!kind) throw new ContentError(file, `debe estar en content/posts/, content/docs/ o content/pages/ (está en content/${top}/)`);
  const rest = segments.slice(1);
  const fileName = rest[rest.length - 1] ?? '';
  const folders = rest.slice(0, -1).map(slugify);

  if (kind === 'page') {
    const slug = fm.slug ?? slugify(fileName);
    const reserved = ['articles', 'docs', 'tags', 'categories', 'search', 'admin', '404'];
    if (reserved.includes(slug)) throw new ContentError(file, `"/${slug}" es una ruta reservada del sitio`);
    return { kind, slug, url: `/${slug}`, section: undefined };
  }

  if (kind === 'post') {
    const slug = fm.slug ?? slugify(fileName);
    const year = /^\d{4}$/.test(folders[0] ?? '') ? folders[0] : String(fm.date.getUTCFullYear());
    return { kind, slug, url: `/articles/${year}/${slug}`, section: undefined };
  }

  const isIndex = /^index\.md$/i.test(fileName);
  const slug = fm.slug ?? (isIndex ? (folders[folders.length - 1] ?? 'docs') : slugify(fileName));
  const parts = isIndex ? folders : [...folders, slug];
  return { kind, slug, url: '/docs' + (parts.length ? '/' + parts.join('/') : ''), section: folders.join('/') };
}

// Caché por (root, drafts): el plugin de Vite y vite-ssg comparten la carga.
const cache = new Map<string, Promise<LoadedContent>>();
export type LoadedContent = { entries: ContentEntry[]; rendered: Map<string, RenderResult> };

export function loadContent(opts: LoadOptions) {
  const key = `${opts.root}|${opts.includeDrafts}`;
  let p = cache.get(key);
  if (!p) {
    p = loadContentUncached(opts);
    cache.set(key, p);
    p.catch(() => cache.delete(key));
  }
  return p;
}

export const invalidateContent = () => cache.clear();

async function loadContentUncached(opts: LoadOptions): Promise<LoadedContent> {
  const contentRoot = path.join(opts.root, CONTENT_DIR);
  const publicDir = path.join(opts.root, 'public');
  const renderer = await createRenderer(opts.markdown, publicDir);
  const entries: ContentEntry[] = [];
  const rendered = new Map<string, RenderResult>();
  const seenUrls = new Map<string, string>();

  for (const file of walk(contentRoot)) {
    const relPath = path.relative(contentRoot, file).split(path.sep).join('/');
    const { data, content } = matter.read(file);
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => `${i.path.join('.') || 'frontmatter'}: ${i.message}`).join('; ');
      throw new ContentError(relPath, issues);
    }
    const fm = parsed.data;
    if (fm.draft && !opts.includeDrafts) continue;

    if (fm.image && !fm.image.startsWith('http') && !fs.existsSync(path.join(opts.root, 'public', fm.image))) {
      throw new ContentError(relPath, `la imagen "${fm.image}" no existe en public/`);
    }

    const { kind, slug, url, section } = resolveLocation(relPath, fm, relPath);
    const dup = seenUrls.get(url);
    if (dup) throw new ContentError(relPath, `genera la misma URL (${url}) que ${dup}`);
    seenUrls.set(url, relPath);

    const result = renderer.render(content);
    rendered.set(relPath, result);

    entries.push({
      file,
      body: content,
      meta: {
        id: relPath,
        kind,
        slug,
        url,
        title: fm.title,
        date: isoDate(fm.date),
        category: fm.category,
        tags: fm.tags,
        author: fm.author,
        abstract: fm.abstract,
        image: fm.image,
        imageSrcset: srcsetFor(publicDir, fm.image),
        draft: fm.draft,
        comments: fm.comments,
        section,
        order: fm.order,
        readingTime: readingTime(result.text),
      },
    });
  }

  entries.sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.meta.title.localeCompare(b.meta.title));
  return { entries, rendered };
}

/** Árbol de navegación de docs a partir de las secciones (carpetas). */
export function buildDocsTree(metas: ContentMeta[]): DocNode[] {
  type Folder = DocNode & { key: string; folders: Map<string, Folder> };
  const makeFolder = (key: string): Folder => ({ key, title: key, order: 999, children: [], folders: new Map() });
  const root = makeFolder('');

  const ensureFolder = (segments: string[]) => {
    let node = root;
    for (const seg of segments) {
      let child = node.folders.get(seg);
      if (!child) {
        child = makeFolder(seg);
        node.folders.set(seg, child);
        node.children.push(child);
      }
      node = child;
    }
    return node;
  };

  for (const m of metas.filter(m => m.kind === 'doc')) {
    const folders = m.section ? m.section.split('/') : [];
    const folderUrl = '/docs' + (folders.length ? '/' + folders.join('/') : '');
    if (m.url === folderUrl && folders.length) {
      // index.md de la sección: da título/orden/url a la carpeta
      Object.assign(ensureFolder(folders), { title: m.title, url: m.url, order: m.order ?? 999 });
    } else {
      ensureFolder(folders).children.push({ title: m.title, url: m.url, order: m.order ?? 999, children: [] });
    }
  }

  const finalize = (nodes: DocNode[]): DocNode[] =>
    nodes
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
      .map(n => ({ title: n.title, url: n.url, order: n.order, children: finalize(n.children) }));
  return finalize(root.children);
}

export function buildSearchIndex(entries: ContentEntry[], rendered: Map<string, RenderResult>) {
  const index = new MiniSearch<SearchDoc>(searchOptions);
  index.addAll(entries.map(({ meta }) => ({
    id: meta.id,
    url: meta.url,
    kind: meta.kind,
    title: meta.title,
    tags: meta.tags.join(', '),
    abstract: meta.abstract ?? '',
    category: meta.category ?? '',
    author: meta.author ?? '',
    date: meta.date,
    image: meta.image ?? '',
    body: (rendered.get(meta.id)?.text ?? '').slice(0, 30_000),
  })));
  return JSON.stringify(index);
}

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildSitemap(metas: ContentMeta[], siteUrl: string, extraUrls: string[] = []) {
  const urls = [
    { loc: '/', lastmod: metas[0]?.date },
    ...extraUrls.map(u => ({ loc: u, lastmod: undefined as string | undefined })),
    ...metas.map(m => ({ loc: m.url, lastmod: m.date })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${xml(siteUrl + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    `\n</urlset>\n`;
}

export function buildRss(metas: ContentMeta[], site: { url: string; title: string; description: string; lang: string }, limit: number) {
  const posts = metas.filter(m => m.kind === 'post').slice(0, limit);
  const items = posts.map(m => `    <item>
      <title>${xml(m.title)}</title>
      <link>${xml(site.url + m.url)}</link>
      <guid isPermaLink="true">${xml(site.url + m.url)}</guid>
      <pubDate>${new Date(m.date).toUTCString()}</pubDate>
      ${m.author ? `<dc:creator>${xml(m.author)}</dc:creator>` : ''}
      ${m.category ? `<category>${xml(m.category)}</category>` : ''}
      <description>${xml(m.abstract ?? '')}</description>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(site.title)}</title>
    <link>${xml(site.url)}</link>
    <atom:link href="${xml(site.url)}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${xml(site.description)}</description>
    <language>${site.lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
