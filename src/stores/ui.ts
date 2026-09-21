import { defineStore } from 'pinia';
import MiniSearch, { type SearchOptions, type SearchResult } from 'minisearch';
import { entries, docsTree } from 'virtual:content';
import type { ContentMeta, DocNode } from '@/content/types';
import { searchOptions, removeAccents, type SearchDoc } from '@/content/search-options';

// ── Contenido (generado en build por build/plugin.ts) ───────────────────────

/** Todo el contenido, del más reciente al más antiguo. */
export const allContent: ContentMeta[] = entries;
/** Solo posts (blog): portada, sidebar, RSS. */
export const posts: ContentMeta[] = entries.filter(e => e.kind === 'post');
/** Solo docs, ordenados por sección/orden (mismo orden que el árbol). */
export const docs: ContentMeta[] = flattenTree(docsTree)
  .map(url => entries.find(e => e.url === url)!)
  .filter(Boolean);
export const docsNav: DocNode[] = docsTree;
/** Páginas sueltas (about, contacto…) */
export const pages: ContentMeta[] = entries.filter(e => e.kind === 'page');

export const findByUrl = (url: string) => allContent.find(a => a.url === url);

function flattenTree(nodes: DocNode[]): string[] {
  return nodes.flatMap(n => [...(n.url ? [n.url] : []), ...flattenTree(n.children)]);
}

const countBy = (pick: (m: ContentMeta) => string[]) => {
  const count = new Map<string, number>();
  for (const m of allContent) if (m.kind !== 'page') for (const k of pick(m)) count.set(k, (count.get(k) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

/** [tag, cantidad] ordenados por frecuencia */
export const tagCounts = countBy(m => m.tags);
export const popularTags = tagCounts.map(([t]) => t);
/** [categoría, cantidad] ordenados por frecuencia */
export const categoryCounts = countBy(m => (m.category ? [m.category] : []));
export const availableCategories = categoryCounts.map(([c]) => c);

// ── Búsqueda ────────────────────────────────────────────────────────────────

export type SearchField = 'title' | 'tags' | 'abstract' | 'category' | 'author' | 'body';
export type SearchHit = SearchResult & Omit<SearchDoc, 'body'>;

export interface AdvancedSearchOptions {
  fuzzyLevel: 'exact' | 'normal' | 'aggressive';
  searchFields: SearchField[];
  categoryFilter: string | null;
  sortBy: 'relevance' | 'date-desc' | 'date-asc' | 'title';
  prefixSearch: boolean;
  combineWith: 'AND' | 'OR';
}

export const defaultSearchOptions: AdvancedSearchOptions = {
  fuzzyLevel: 'normal',
  searchFields: ['title', 'tags', 'abstract', 'category', 'author', 'body'],
  categoryFilter: null,
  sortBy: 'relevance',
  prefixSearch: true,
  combineWith: 'OR',
};

const FIELD_BOOST: Record<SearchField, number> = { title: 3, tags: 2, category: 1.5, abstract: 1, author: 1, body: 0.5 };
const FUZZY: Record<AdvancedSearchOptions['fuzzyLevel'], number | false> = { exact: false, normal: 0.2, aggressive: 0.4 };

// El índice (con el cuerpo de todos los artículos) se carga bajo demanda la
// primera vez que se busca; hasta entonces `results` está vacío.
let miniSearch: MiniSearch<SearchDoc> | null = null;
let loading: Promise<void> | null = null;

export const useUiStore = defineStore('ui', {
  state: () => ({
    searchbar: false,
    search: '',
    sidebar: true,
    loading: false,
    searchReady: false,
    advancedOptions: { ...defaultSearchOptions } as AdvancedSearchOptions,
  }),
  getters: {
    /** Resultados de la búsqueda simple (navbar/modal). */
    results(state): SearchHit[] {
      const val = state.search.trim();
      if (!val || !state.searchReady || !miniSearch) return [];
      return miniSearch.search(removeAccents(val), {
        prefix: true,
        fuzzy: 0.2,
        boost: FIELD_BOOST,
      }) as SearchHit[];
    },
  },
  actions: {
    /** Carga el índice serializado (un chunk aparte) una sola vez. */
    async ensureSearchIndex() {
      if (this.searchReady) return;
      loading ??= import('virtual:content/search').then(({ default: json }) => {
        miniSearch = MiniSearch.loadJSON<SearchDoc>(json, searchOptions);
        this.searchReady = true;
      });
      await loading;
    },
    toggleSearch() {
      this.searchbar = !this.searchbar;
      if (this.searchbar) this.ensureSearchIndex();
    },
    onClickOutside() {
      if (this.searchbar) this.searchbar = false;
    },
    onloading(val: boolean) {
      this.loading = val;
    },
    toggleSideBar() {
      this.sidebar = !this.sidebar;
    },
    resetSearchOptions() {
      this.advancedOptions = { ...defaultSearchOptions };
    },
    updateSearchOption<K extends keyof AdvancedSearchOptions>(key: K, value: AdvancedSearchOptions[K]) {
      this.advancedOptions[key] = value;
    },

    /** Búsqueda avanzada (página /search). */
    advancedSearch(val: string, options?: Partial<AdvancedSearchOptions>): SearchHit[] {
      this.search = val;
      if (!val.trim() || !this.searchReady || !miniSearch) return [];

      const opts = { ...this.advancedOptions, ...options };
      const boost: Record<string, number> = {};
      for (const field of opts.searchFields) boost[field] = FIELD_BOOST[field];

      const searchOpts: SearchOptions = {
        prefix: opts.prefixSearch,
        fuzzy: FUZZY[opts.fuzzyLevel],
        boost,
        combineWith: opts.combineWith,
        fields: opts.searchFields,
      };

      let results = miniSearch.search(removeAccents(val), searchOpts) as SearchHit[];
      if (opts.categoryFilter) results = results.filter(r => r.category === opts.categoryFilter);

      switch (opts.sortBy) {
        case 'date-desc': results.sort((a, b) => b.date.localeCompare(a.date)); break;
        case 'date-asc': results.sort((a, b) => a.date.localeCompare(b.date)); break;
        case 'title': results.sort((a, b) => a.title.localeCompare(b.title)); break;
      }
      return results;
    },

    getSuggestions(val: string, limit = 5) {
      if (val.trim().length < 2 || !this.searchReady || !miniSearch) return [];
      return miniSearch.autoSuggest(removeAccents(val), {
        prefix: true,
        fuzzy: 0.2,
        boost: { title: 3 },
        fields: ['title', 'tags', 'category'],
      }).slice(0, limit);
    },
  },
});
