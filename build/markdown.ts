/**
 * Renderizador de Markdown usado en el BUILD (nunca en el navegador):
 * shiki (código), KaTeX (fórmulas), anclas en títulos, admonitions
 * (::: tip / warning / danger / info / details) y TOC.
 */
import MarkdownIt, { type PluginWithParams } from 'markdown-it';
import anchor from 'markdown-it-anchor';
import containerPlugin from 'markdown-it-container';
import katexPlugin from '@vscode/markdown-it-katex';
import { createHighlighter, type HighlighterGeneric, type BundledLanguage } from 'shiki';
import { fromHighlighter } from '@shikijs/markdown-it/core';
import type { TocEntry } from '../src/content/types';
import { srcsetFor, BODY_SIZES } from './images';

export interface MarkdownOptions {
  allowHtml: boolean;
  codeTheme: { light: string; dark: string };
}

export interface RenderResult {
  html: string;
  toc: TocEntry[];
  /** Texto plano (para el índice de búsqueda y el tiempo de lectura) */
  text: string;
}

const CODE_LANGS = [
  'bash', 'shell', 'powershell', 'bat', 'javascript', 'typescript', 'json', 'yaml', 'toml', 'ini',
  'html', 'css', 'scss', 'vue', 'python', 'sql', 'diff', 'dockerfile', 'nginx', 'markdown',
  'xml', 'c', 'cpp', 'csharp', 'go', 'rust', 'java', 'php', 'ruby', 'lua', 'regex',
];

// 'text' es un lenguaje especial de shiki (sin resaltado); su tipo no lo admite.
const PLAIN = 'text' as BundledLanguage;

const ADMONITIONS = ['tip', 'info', 'warning', 'danger'] as const;

// Plugins CJS: según cómo se empaquete la config, el default puede venir anidado.
const interop = <T>(mod: T): T => ((mod as any)?.default ?? mod) as T;
const container = interop(containerPlugin) as unknown as PluginWithParams;
const katex = interop(katexPlugin) as unknown as PluginWithParams;

export const slugifyHeading = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

let highlighterPromise: Promise<HighlighterGeneric<any, any>> | undefined;
const getHighlighter = (themes: string[]) => {
  highlighterPromise ??= createHighlighter({ themes, langs: CODE_LANGS });
  return highlighterPromise;
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function createRenderer(options: MarkdownOptions, publicDir?: string) {
  const highlighter = await getHighlighter([options.codeTheme.light, options.codeTheme.dark]);

  const md = new MarkdownIt({
    html: options.allowHtml,
    linkify: true,
    typographer: true,
  });

  // Tema dual: shiki emite --shiki-light/--shiki-dark y el CSS elige según el tema activo.
  md.use(fromHighlighter(highlighter, {
    themes: options.codeTheme,
    defaultColor: false,
    fallbackLanguage: PLAIN,
    defaultLanguage: PLAIN,
  }));
  md.use(katex);
  md.use(anchor, {
    level: [2, 3, 4],
    slugify: slugifyHeading,
    permalink: anchor.permalink.headerLink({ safariReaderFix: true }),
  });

  for (const name of ADMONITIONS) {
    md.use(container, name, {
      render(tokens: any[], idx: number) {
        const token = tokens[idx];
        if (token.nesting === 1) {
          const title = token.info.trim().slice(name.length).trim() || name.toUpperCase();
          return `<div class="admonition admonition-${name}"><p class="admonition-title">${escapeHtml(title)}</p>\n`;
        }
        return '</div>\n';
      },
    });
  }
  md.use(container, 'details', {
    render(tokens: any[], idx: number) {
      const token = tokens[idx];
      if (token.nesting === 1) {
        const summary = token.info.trim().slice('details'.length).trim() || 'Detalles';
        return `<details class="admonition-details"><summary>${escapeHtml(summary)}</summary>\n`;
      }
      return '</details>\n';
    },
  });

  // Imágenes: carga diferida; enlaces externos en pestaña nueva.
  const defaultImage = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens, idx, opts, env, self) => {
    tokens[idx].attrSet('loading', 'lazy');
    tokens[idx].attrSet('decoding', 'async');
    const srcset = publicDir ? srcsetFor(publicDir, tokens[idx].attrGet('src') ?? undefined) : undefined;
    if (srcset) {
      tokens[idx].attrSet('srcset', srcset);
      tokens[idx].attrSet('sizes', BODY_SIZES);
    }
    return defaultImage(tokens, idx, opts, env, self);
  };
  const defaultLinkOpen = md.renderer.rules.link_open ?? ((t, i, o, e, s) => s.renderToken(t, i, o));
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const href = tokens[idx].attrGet('href') ?? '';
    if (/^https?:\/\//.test(href)) {
      tokens[idx].attrSet('target', '_blank');
      tokens[idx].attrSet('rel', 'noopener');
    }
    return defaultLinkOpen(tokens, idx, opts, env, self);
  };

  return {
    render(source: string): RenderResult {
      const tokens = md.parse(source, {});
      const toc: TocEntry[] = [];
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.type === 'heading_open' && (t.tag === 'h2' || t.tag === 'h3')) {
          const inline = tokens[i + 1];
          const text = inline?.children?.filter(c => c.type === 'text' || c.type === 'code_inline').map(c => c.content).join('') ?? '';
          toc.push({ level: t.tag === 'h2' ? 2 : 3, id: t.attrGet('id') ?? slugifyHeading(text), text });
        }
      }
      const html = md.renderer.render(tokens, md.options, {});
      return { html, toc, text: htmlToText(html) };
    },
  };
}

export function htmlToText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export const readingTime = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 200));
