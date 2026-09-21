/**
 * site.config.ts — TODO lo específico de tu sitio vive aquí.
 *
 * Quien reutilice CoreDump solo debería tocar este archivo, la carpeta
 * `content/` (markdown) y `public/images/` (imágenes de los artículos).
 */

export interface SiteAuthor {
  name: string;
  bio?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export interface GiscusConfig {
  enabled: boolean;
  /** "usuario/repo" PÚBLICO con Discussions activadas */
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: 'pathname' | 'url' | 'title' | 'og:title';
  lang: string;
  theme: string;
}

export interface SiteConfig {
  /** Nombre corto (navbar, footer, título de pestaña) */
  name: string;
  /** Título completo para <title> y og:title de la portada */
  title: string;
  description: string;
  /** URL pública sin barra final. Se usa para sitemap, RSS y og:url. */
  url: string;
  /** Idioma del sitio (atributo lang, textos de la UI en src/locales/<lang>.json) */
  lang: string;
  /** Locale para formatear fechas */
  locale: string;
  author: SiteAuthor;
  /** Frases que rotan en la portada y el sidebar */
  slogans: string[];
  /** Enlaces del navbar/footer, además de "Documentación" (que aparece si hay docs) */
  nav: { label: string; to: string }[];
  /** Cuántos posts muestra la portada (bento: hasta 6) y el sidebar */
  home: { featured: number; recent: number };
  markdown: {
    /** Permitir HTML embebido en los .md (desactivado por seguridad) */
    allowHtml: boolean;
    /** Temas de shiki para bloques de código (uno por tema de la UI) */
    codeTheme: { light: string; dark: string };
  };
  theme: {
    /** Tema inicial; el visitante puede cambiarlo (se recuerda en localStorage) */
    default: 'dark' | 'light' | 'system';
    /** Color de acento (botones, enlaces, títulos) por tema */
    primary: { light: string; dark: string };
  };
  /** Feed RSS y sitemap generados en el build */
  feed: { enabled: boolean; limit: number };
  comments: GiscusConfig;
  /**
   * Analítica sin cookies (opcional). Plausible y Umami respetan la privacidad
   * y no requieren banner de consentimiento en la UE.
   */
  analytics:
    | { provider: 'none' }
    | { provider: 'plausible'; domain: string; /** script propio si usas self-hosting */ src?: string }
    | { provider: 'umami'; websiteId: string; src?: string };
}

export const siteConfig: SiteConfig = {
  name: 'CoreDump',
  title: 'CoreDump.md',
  description: 'Blog técnico minimalista: soporte, errores y soluciones documentadas en Markdown.',
  url: 'https://coredumpmd.netlify.app',
  lang: 'es',
  locale: 'es-ES',

  author: {
    name: 'Soporte mental',
    bio: 'Soportamos máquinas, personas. No hay quien nos soporte.',
    email: 'quarkup@tutanota.com',
    github: 'cypherfunk-dev',
    linkedin: 'carlosandresgm',
  },

  slogans: [
    'Soporte técnico para máquinas. Soporte vital para usuarios.',
    'Vaciando mi memoria antes del colapso total.',
    'Documentando el caos. Si no está en Markdown, no sucedió.',
    'Soportamos sistemas, toleramos personas.',
    'Arreglando lo que las máquinas rompen y lo que los usuarios tocan.',
    'Bitácora de errores críticos y soluciones improvisadas. Léase antes de reiniciar.',
  ],

  // Páginas sueltas: content/pages/<slug>.md → /<slug>
  nav: [{ label: 'Acerca de', to: '/about' }],

  home: { featured: 6, recent: 5 },

  markdown: {
    allowHtml: false,
    codeTheme: { light: 'github-light-default', dark: 'github-dark-default' },
  },

  theme: {
    default: 'dark',
    primary: { light: '#00875A', dark: '#69F0AE' },
  },

  feed: { enabled: true, limit: 20 },

  // { provider: 'plausible', domain: 'midominio.com' }
  // { provider: 'umami', websiteId: 'xxxxxxxx-xxxx-...' }
  analytics: { provider: 'none' },

  comments: {
    // Pasos: 1) repo público con Discussions activadas, 2) instalar
    // https://github.com/apps/giscus en ese repo, 3) copiar los IDs que
    // genera https://giscus.app y poner enabled: true.
    enabled: false,
    repo: 'cypherfunk-dev/CoreDump',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
    // 'pathname': cada artículo se vincula por su URL. Renombrar el archivo
    // .md (o cambiar su `slug`) desvincula sus comentarios.
    mapping: 'pathname',
    lang: 'es',
    theme: 'dark_dimmed',
  },
};
