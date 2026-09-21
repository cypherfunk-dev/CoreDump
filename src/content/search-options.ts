import type { Options } from 'minisearch';

/**
 * Opciones de MiniSearch compartidas entre el build (que serializa el índice)
 * y el cliente (que lo carga con `MiniSearch.loadJSON`). Deben ser idénticas.
 */
export interface SearchDoc {
  id: string;
  url: string;
  kind: string;
  title: string;
  tags: string;
  abstract: string;
  category: string;
  author: string;
  date: string;
  image: string;
  /** Texto plano del cuerpo (permite buscar comandos/errores dentro del artículo) */
  body: string;
}

export const removeAccents = (str: string) => str.normalize('NFD').replace(/\p{M}/gu, '');

export const SEARCH_FIELDS = ['title', 'tags', 'abstract', 'category', 'author', 'body'] as const;

export const searchOptions: Options<SearchDoc> = {
  idField: 'id',
  fields: [...SEARCH_FIELDS],
  storeFields: ['id', 'url', 'kind', 'title', 'tags', 'abstract', 'category', 'author', 'date', 'image'],
  tokenize: (text) => text.toLowerCase().split(/[\s\-_.,;:!?()[\]{}'"`/\<>=|]+/).filter(t => t.length > 1),
  processTerm: (term) => removeAccents(term.toLowerCase()),
};
