/**
 * Plugin de Vite que convierte `content/` en módulos:
 *
 *   import { entries, docsTree } from 'virtual:content'   // metadata (eager, pequeño)
 *   import('virtual:content/search')                       // índice MiniSearch serializado (lazy)
 *   import.meta.glob('/content/** /*.md', { query: '?page' }) // { html, toc } por artículo (lazy)
 *
 * Además emite sitemap.xml y rss.xml en el build.
 */
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import {
  CONTENT_DIR, ContentError, loadContent, invalidateContent, buildDocsTree, buildSearchIndex, buildSitemap, buildRss,
} from './content';
import type { SiteConfig } from '../src/site.config';

const VIRTUAL_INDEX = 'virtual:content';
const VIRTUAL_SEARCH = 'virtual:content/search';
const resolved = (id: string) => '\0' + id;

export function coredumpContent(site: SiteConfig): Plugin {
  let root = process.cwd();
  let isProduction = false;
  const load = () => loadContent({ root, includeDrafts: !isProduction, markdown: site.markdown });

  const invalidate = (server?: ViteDevServer) => {
    invalidateContent();
    if (!server) return;
    for (const id of [resolved(VIRTUAL_INDEX), resolved(VIRTUAL_SEARCH)]) {
      const mod = server.moduleGraph.getModuleById(id);
      if (mod) server.moduleGraph.invalidateModule(mod);
    }
    server.ws.send({ type: 'full-reload' });
  };

  const isContentFile = (file: string) =>
    file.endsWith('.md') && path.resolve(file).startsWith(path.resolve(root, CONTENT_DIR));

  return {
    name: 'coredump:content',
    enforce: 'pre',

    configResolved(config) {
      root = config.root;
      isProduction = config.isProduction;
    },

    configureServer(server) {
      const dir = path.resolve(root, CONTENT_DIR);
      server.watcher.add(dir);
      server.watcher.on('add', f => isContentFile(f) && invalidate(server));
      server.watcher.on('unlink', f => isContentFile(f) && invalidate(server));
      server.watcher.on('change', f => isContentFile(f) && invalidate(server));

      // sitemap y rss también en dev, para poder comprobarlos
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/sitemap.xml' && req.url !== '/rss.xml') return next();
        const { entries } = await load();
        const metas = entries.map(e => e.meta);
        res.setHeader('Content-Type', 'application/xml');
        res.end(req.url === '/sitemap.xml'
          ? buildSitemap(metas, site.url)
          : buildRss(metas, site, site.feed.limit));
      });
    },

    resolveId(id) {
      if (id === VIRTUAL_INDEX || id === VIRTUAL_SEARCH) return resolved(id);
    },

    async load(id) {
      if (id === resolved(VIRTUAL_INDEX)) {
        const { entries } = await load();
        const metas = entries.map(e => e.meta);
        return `export const entries = ${JSON.stringify(metas)};\n` +
               `export const docsTree = ${JSON.stringify(buildDocsTree(metas))};\n`;
      }
      if (id === resolved(VIRTUAL_SEARCH)) {
        const { entries, rendered } = await load();
        return `export default ${JSON.stringify(buildSearchIndex(entries, rendered))};`;
      }
    },

    // `?page`: cuerpo renderizado de un .md concreto (un chunk por artículo).
    async transform(_code, id) {
      const [file, query] = id.split('?');
      if (query !== 'page' || !file.endsWith('.md')) return;
      const { entries, rendered } = await load();
      const rel = path.relative(path.resolve(root, CONTENT_DIR), file).split(path.sep).join('/');
      const entry = entries.find(e => e.meta.id === rel);
      const page = rendered.get(rel);
      if (!entry || !page) {
        // borrador excluido en producción, o archivo fuera de content/
        return { code: 'export default null;', map: null };
      }
      return { code: `export default ${JSON.stringify({ html: page.html, toc: page.toc })};`, map: null };
    },

    async generateBundle() {
      if (!site.feed.enabled) return;
      const { entries } = await load();
      const metas = entries.map(e => e.meta);
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(metas, site.url, ['/docs', '/tags', '/categories']) });
      this.emitFile({ type: 'asset', fileName: 'rss.xml', source: buildRss(metas, site, site.feed.limit) });
    },

    buildEnd(error) {
      if (error instanceof ContentError) this.error(error.message);
    },
  };
}
