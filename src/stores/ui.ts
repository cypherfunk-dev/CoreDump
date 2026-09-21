import { defineStore } from 'pinia';
import database from '../database/db.json';
import MiniSearch, { type SearchOptions } from 'minisearch';

export interface Article {
  id: string;
  slug: string;
  metadata: {
    title: string;
    date: string;
    category?: string;
    tags?: string;
    author?: string;
    abstract?: string;
    image?: string;
  };
}

// Artículos ordenados del más reciente al más antiguo (fuente única para
// portada, sidebar y página de artículo).
export const articles: Article[] = [...(database as Article[])].sort(
  (a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
);

export const findArticle = (slug: string) => articles.find(a => a.slug === slug);

// Tags únicos ordenados por frecuencia (para la nube de tags del sidebar).
export const popularTags: string[] = (() => {
  const count = new Map<string, number>();
  for (const a of articles) {
    for (const tag of (a.metadata.tags ?? '').split(',')) {
      const t = tag.trim();
      if (t) count.set(t, (count.get(t) ?? 0) + 1);
    }
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
})();

const accessNested = (obj: any, path: string) => {
  return path.split('.').reduce((doc, key) => {
    const intKey = parseInt(key, 10);
    return doc && doc[isNaN(intKey) ? key : intKey];
  }, obj);
}

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Create MiniSearch instance once
const miniSearch = new MiniSearch({
  idField: 'id',
  extractField: (doc, fieldName) => accessNested(doc, fieldName),
  fields: ['metadata.title', 'metadata.tags', 'metadata.abstract', 'metadata.category', 'metadata.date', 'metadata.author'],
  storeFields: ['id', 'slug', 'metadata.title', 'metadata.tags', 'metadata.abstract', 'metadata.date', 'metadata.category', 'metadata.author'],
  // Custom tokenizer to handle special characters
  tokenize: (text) => text.toLowerCase().split(/[\s\-_.,;:!?()[\]{}'"]+/).filter(t => t.length > 1),
  processTerm: (term) => removeAccents(term.toLowerCase())
});
miniSearch.addAll(database);

// Extract unique categories from database
export const availableCategories = [...new Set(
  database.map((doc: any) => doc.metadata?.category).filter(Boolean)
)] as string[];

// Search options interface
export interface AdvancedSearchOptions {
  fuzzyLevel: 'exact' | 'normal' | 'aggressive';
  searchFields: ('title' | 'tags' | 'abstract' | 'category' | 'author')[];
  categoryFilter: string | null;
  sortBy: 'relevance' | 'date-desc' | 'date-asc' | 'title';
  prefixSearch: boolean;
  combineWith: 'AND' | 'OR';
}

export const defaultSearchOptions: AdvancedSearchOptions = {
  fuzzyLevel: 'normal',
  searchFields: ['title', 'tags', 'abstract', 'category', 'author'],
  categoryFilter: null,
  sortBy: 'relevance',
  prefixSearch: true,
  combineWith: 'OR'
};

export const useUiStore = defineStore('ui', {
  state: () => ({
    searchbar: false,
    search: '',
    sidebar: true,
    loading: false,
    advancedOptions: { ...defaultSearchOptions } as AdvancedSearchOptions
  }),
  getters: {
    // Resultados de la búsqueda simple (navbar/modal). Al ser un getter se
    // cachea y solo se recalcula cuando cambia `search`.
    results: (state) => {
      const val = state.search.trim();
      if (!val) return [];
      return miniSearch.search(removeAccents(val), {
        prefix: true,
        fuzzy: 0.2,
        boost: { 'metadata.title': 2, 'metadata.tags': 1.5 }
      });
    }
  },
  actions: {
    toggleSearch() {
      this.searchbar = !this.searchbar;
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
    
    // Advanced search with options
    advancedSearch(val: string, options?: Partial<AdvancedSearchOptions>) {
      this.search = val;
      if (!val || val.trim() === '') return [];
      
      const opts = { ...this.advancedOptions, ...options };
      
      // Map fuzzy levels to numeric values
      const fuzzyMap = {
        'exact': false as const,
        'normal': 0.2,
        'aggressive': 0.4
      };
      
      // Map search fields to MiniSearch field names
      const fieldMap: Record<AdvancedSearchOptions['searchFields'][number], string> = {
        'title': 'metadata.title',
        'tags': 'metadata.tags',
        'abstract': 'metadata.abstract',
        'category': 'metadata.category',
        'author': 'metadata.author'
      };
      
      // Build boost object based on selected fields
      const boost: Record<string, number> = {};
      for (const field of opts.searchFields) {
        boost[fieldMap[field]] = field === 'title' ? 2 : field === 'tags' ? 1.5 : 1;
      }
      
      // Build search options
      const searchOptions: SearchOptions = {
        prefix: opts.prefixSearch,
        fuzzy: fuzzyMap[opts.fuzzyLevel],
        boost,
        combineWith: opts.combineWith,
        // Only search in selected fields
        fields: opts.searchFields.map(f => fieldMap[f])
      };
      
      let results = miniSearch.search(removeAccents(val), searchOptions);
      
      // Apply category filter
      if (opts.categoryFilter) {
        results = results.filter(r => r['metadata.category'] === opts.categoryFilter);
      }
      
      // Apply sorting
      switch (opts.sortBy) {
        case 'date-desc':
          results.sort((a, b) => new Date(b['metadata.date']).getTime() - new Date(a['metadata.date']).getTime());
          break;
        case 'date-asc':
          results.sort((a, b) => new Date(a['metadata.date']).getTime() - new Date(b['metadata.date']).getTime());
          break;
        case 'title':
          results.sort((a, b) => (a['metadata.title'] || '').localeCompare(b['metadata.title'] || ''));
          break;
        // 'relevance' is default from MiniSearch, no re-sort needed
      }
      
      return results;
    },
    
    // Auto-suggest for search input
    getSuggestions(val: string, limit = 5) {
      if (!val || val.trim().length < 2) return [];
      
      const suggestions = miniSearch.autoSuggest(removeAccents(val), {
        prefix: true,
        fuzzy: 0.2,
        boost: { 'metadata.title': 3 }
      });
      
      return suggestions.slice(0, limit);
    }
  }
});