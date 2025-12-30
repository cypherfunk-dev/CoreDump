import { defineStore } from 'pinia';
import database from '../database/db.json';
import MiniSearch, { type SearchOptions } from 'minisearch';

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
    
    // Simple search (for navbar/modal)
    queryChange(val: string) {
      this.search = val;
      if (!val || val.trim() === '') return [];
      
      const results = miniSearch.search(removeAccents(val), {
        prefix: true,
        fuzzy: 0.2,
        boost: { 'metadata.title': 2, 'metadata.tags': 1.5 }
      });
      return results;
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
      const fieldMap: Record<string, string> = {
        'title': 'metadata.title',
        'tags': 'metadata.tags',
        'abstract': 'metadata.abstract',
        'category': 'metadata.category',
        'author': 'metadata.author'
      };
      
      // Build boost object based on selected fields
      const boost: Record<string, number> = {};
      opts.searchFields.forEach(field => {
        const mappedField = fieldMap[field];
        if (field === 'title') boost[mappedField] = 2;
        else if (field === 'tags') boost[mappedField] = 1.5;
        else boost[mappedField] = 1;
      });
      
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