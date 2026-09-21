import es from '@/locales/es.json';
import { siteConfig } from '@/site.config';

/**
 * Textos de la interfaz. Para otro idioma: copia src/locales/es.json a
 * <lang>.json, tradúcelo y cambia `lang` en site.config.ts.
 */
const locales: Record<string, typeof es> = {
  es,
  ...Object.fromEntries(
    Object.entries(import.meta.glob<{ default: typeof es }>('@/locales/*.json', { eager: true }))
      .map(([path, mod]) => [path.match(/([a-z-]+)\.json$/i)![1], mod.default]),
  ),
};

export type UiTexts = typeof es;

export function useTexts(lang?: string): UiTexts {
  return locales[lang ?? siteConfig.lang] ?? es;
}

/** t('readingTime', { minutes: 3 }) → "3 min de lectura" */
export function t(key: keyof UiTexts, params: Record<string, string | number> = {}, lang?: string): string {
  const raw = useTexts(lang)[key];
  return String(raw).replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}
