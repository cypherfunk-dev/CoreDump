/** Metadata de una entrada de contenido, tal como la expone `virtual:content`. */
/** post: content/posts (blog) · doc: content/docs (árbol) · page: content/pages (sueltas, /<slug>) */
export type ContentKind = 'post' | 'doc' | 'page';

export interface TocEntry {
  level: 2 | 3;
  id: string;
  text: string;
}

export interface ContentMeta {
  /** Ruta relativa dentro de content/ (clave estable para import.meta.glob) */
  id: string;
  kind: ContentKind;
  /** Último segmento de la URL */
  slug: string;
  /** Ruta pública: /articles/2026/mi-post o /docs/guia/instalacion */
  url: string;
  title: string;
  /** ISO 8601 (YYYY-MM-DD) */
  date: string;
  category?: string;
  tags: string[];
  author?: string;
  abstract?: string;
  image?: string;
  /** srcset de `image` si `npm run images` generó variantes (480/960) */
  imageSrcset?: string;
  draft: boolean;
  comments: boolean;
  /** Solo docs: carpeta (sección) y orden dentro de ella */
  section?: string;
  order?: number;
  /** Minutos de lectura estimados */
  readingTime: number;
}

/** Cuerpo renderizado, cargado bajo demanda por página (`?page`). */
export interface ContentPage {
  html: string;
  toc: TocEntry[];
}

/** Nodo del árbol de navegación de docs. */
export interface DocNode {
  title: string;
  url?: string;
  order: number;
  children: DocNode[];
}
