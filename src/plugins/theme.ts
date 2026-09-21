import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { siteConfig } from '@/site.config';

const STORAGE_KEY = 'coredump-theme';
type ThemeName = 'light' | 'dark';

const systemTheme = (): ThemeName =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

/** Tema inicial: preferencia guardada → site.config → sistema. */
export function resolveInitialTheme(): ThemeName {
  if (typeof window === 'undefined') return siteConfig.theme.default === 'light' ? 'light' : 'dark';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* modo privado, etc. */ }
  return siteConfig.theme.default === 'system' ? systemTheme() : siteConfig.theme.default;
}

/** Composable para el botón de cambio de tema. */
export function useThemeToggle() {
  const theme = useTheme();
  const toggle = () => {
    theme.change(theme.global.name.value === 'dark' ? 'light' : 'dark');
  };
  watch(() => theme.global.name.value, (name) => {
    try { localStorage.setItem(STORAGE_KEY, name); } catch { /* ignore */ }
  });
  return { theme, toggle };
}
