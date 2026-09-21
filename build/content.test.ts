import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { slugify, resolveLocation, buildDocsTree, buildSitemap, buildRss, loadContent, invalidateContent, type Frontmatter } from './content';
import type { ContentMeta } from '../src/content/types';
import { srcsetFor } from './images';

const fm = (over: Partial<Frontmatter> = {}): Frontmatter => ({
  title: 'T', date: new Date('2026-05-01'), tags: [], draft: false, comments: true, ...over,
});

const meta = (over: Partial<ContentMeta>): ContentMeta => ({
  id: 'x', kind: 'doc', slug: 'x', url: '/docs/x', title: 'X', date: '2026-01-01', tags: [],
  draft: false, comments: true, readingTime: 1, ...over,
});

describe('slugify', () => {
  it('quita acentos, mayúsculas, extensión y caracteres raros', () => {
    expect(slugify('Guía_Definitiva (Operación Moonshine).md')).toBe('guia-definitiva-operacion-moonshine');
    expect(slugify('  --Hola--  ')).toBe('hola');
  });
});

describe('resolveLocation', () => {
  it('posts: /articles/<año de carpeta>/<slug>', () => {
    expect(resolveLocation('posts/2026/Mi Post.md', fm(), 'f')).toMatchObject({ kind: 'post', url: '/articles/2026/mi-post' });
  });
  it('posts sin carpeta de año usan el año de la fecha', () => {
    expect(resolveLocation('posts/mi-post.md', fm(), 'f').url).toBe('/articles/2026/mi-post');
  });
  it('respeta slug del frontmatter', () => {
    expect(resolveLocation('posts/2026/x.md', fm({ slug: 'custom' }), 'f').url).toBe('/articles/2026/custom');
  });
  it('docs: carpeta = sección, index.md = URL de la sección', () => {
    expect(resolveLocation('docs/guia/instalacion.md', fm(), 'f')).toMatchObject({ kind: 'doc', url: '/docs/guia/instalacion', section: 'guia' });
    expect(resolveLocation('docs/guia/index.md', fm(), 'f')).toMatchObject({ url: '/docs/guia', slug: 'guia' });
  });
  it('pages: /<slug>, y rechaza rutas reservadas', () => {
    expect(resolveLocation('pages/About Us.md', fm(), 'f')).toMatchObject({ kind: 'page', url: '/about-us' });
    expect(() => resolveLocation('pages/docs.md', fm(), 'pages/docs.md')).toThrow(/reservada/);
  });
  it('rechaza carpetas raíz desconocidas', () => {
    expect(() => resolveLocation('otros/x.md', fm(), 'otros/x.md')).toThrow(/content\/posts/);
  });
});

describe('buildDocsTree', () => {
  it('agrupa por sección, usa index.md para la carpeta y ordena por order', () => {
    const tree = buildDocsTree([
      meta({ url: '/docs/guia/b', title: 'B', section: 'guia', order: 2 }),
      meta({ url: '/docs/guia', title: 'Guía', section: 'guia', order: 1 }),
      meta({ url: '/docs/guia/a', title: 'A', section: 'guia', order: 1 }),
      meta({ url: '/docs/otra/x', title: 'X', section: 'otra' }),
      meta({ url: '/docs/suelto', title: 'Suelto', section: '' }),
    ]);
    expect(tree.map(n => n.title)).toEqual(['Guía', 'otra', 'Suelto']);
    expect(tree[0]).toMatchObject({ url: '/docs/guia', children: [{ title: 'A' }, { title: 'B' }] });
    expect(tree[1]).toMatchObject({ url: undefined, children: [{ url: '/docs/otra/x' }] });
  });
});

describe('sitemap y rss', () => {
  const metas = [
    meta({ kind: 'post', url: '/articles/2026/a', title: 'A & B', date: '2026-02-01', abstract: '<x>' }),
    meta({ kind: 'doc', url: '/docs/d', title: 'D', date: '2026-01-01' }),
  ];
  it('sitemap incluye todas las URLs escapadas', () => {
    const xml = buildSitemap(metas, 'https://s.io', ['/docs']);
    expect(xml).toContain('<loc>https://s.io/articles/2026/a</loc>');
    expect(xml).toContain('<loc>https://s.io/docs</loc>');
    expect(xml).toContain('<lastmod>2026-02-01</lastmod>');
  });
  it('rss solo lleva posts y escapa XML', () => {
    const rss = buildRss(metas, { url: 'https://s.io', title: 'T', description: 'D', lang: 'es' }, 20);
    expect(rss).toContain('<title>A &amp; B</title>');
    expect(rss).toContain('&lt;x&gt;');
    expect(rss).not.toContain('/docs/d');
  });
});

describe('srcsetFor', () => {
  it('solo genera srcset si existen variantes', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'coredump-img-'));
    mkdirSync(path.join(root, 'images/2026'), { recursive: true });
    writeFileSync(path.join(root, 'images/2026/a.webp'), '');
    expect(srcsetFor(root, '/images/2026/a.webp')).toBeUndefined();
    writeFileSync(path.join(root, 'images/2026/a-480.webp'), '');
    expect(srcsetFor(root, '/images/2026/a.webp')).toBe('/images/2026/a-480.webp 480w, /images/2026/a.webp 1600w');
    expect(srcsetFor(root, 'https://cdn/x.webp')).toBeUndefined();
  });
});

describe('loadContent (integración)', () => {
  const md = { allowHtml: false, codeTheme: { light: 'github-light-default', dark: 'github-dark-default' } };

  const makeRoot = (files: Record<string, string>) => {
    const root = mkdtempSync(path.join(tmpdir(), 'coredump-'));
    for (const [rel, body] of Object.entries(files)) {
      const abs = path.join(root, rel);
      mkdirSync(path.dirname(abs), { recursive: true });
      writeFileSync(abs, body);
    }
    invalidateContent();
    return root;
  };

  it('renderiza, ordena por fecha y excluye borradores en producción', async () => {
    const root = makeRoot({
      'content/posts/2026/a.md': '---\ntitle: A\ndate: 2026-01-01\ntags: x, y\n---\n\n## Hola\n\n```bash\nls\n```\n',
      'content/posts/2026/b.md': '---\ntitle: B\ndate: 2026-03-01\ndraft: true\n---\ntexto',
      'content/docs/g/index.md': '---\ntitle: G\ndate: 2026-02-01\n---\n::: tip\nhola\n:::',
    });
    const { entries, rendered } = await loadContent({ root, includeDrafts: false, markdown: md });
    expect(entries.map(e => e.meta.url)).toEqual(['/docs/g', '/articles/2026/a']);
    expect(entries[1].meta.tags).toEqual(['x', 'y']);
    const a = rendered.get('posts/2026/a.md')!;
    expect(a.toc).toEqual([{ level: 2, id: 'hola', text: 'Hola' }]);
    expect(a.html).toContain('class="shiki');
    expect(rendered.get('docs/g/index.md')!.html).toContain('admonition-tip');
  });

  it('falla con un mensaje claro si el frontmatter es inválido', async () => {
    const root = makeRoot({ 'content/posts/2026/bad.md': '---\ndate: ayer\n---\n' });
    await expect(loadContent({ root, includeDrafts: true, markdown: md })).rejects.toThrow(/posts\/2026\/bad\.md.*title/);
  });

  it('falla si la imagen del frontmatter no existe', async () => {
    const root = makeRoot({ 'content/posts/2026/img.md': '---\ntitle: I\ndate: 2026-01-01\nimage: /images/no.webp\n---\n' });
    await expect(loadContent({ root, includeDrafts: true, markdown: md })).rejects.toThrow(/no existe/);
  });
});
