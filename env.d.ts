/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Módulos generados en build por build/plugin.ts
declare module 'virtual:content' {
  import type { ContentMeta, DocNode } from '@/content/types';
  export const entries: ContentMeta[];
  export const docsTree: DocNode[];
}

declare module 'virtual:content/search' {
  /** Índice MiniSearch serializado (JSON) */
  const json: string;
  export default json;
}

declare module '*.md?page' {
  import type { ContentPage } from '@/content/types';
  const page: ContentPage | null;
  export default page;
}
