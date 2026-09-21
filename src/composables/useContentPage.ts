import { computed, ref, watch, type Ref } from 'vue';
import { useHead } from '@unhead/vue';
import { findByUrl } from '@/stores/ui';
import { siteConfig } from '@/site.config';
import type { ContentMeta, ContentPage } from '@/content/types';

// Un chunk por artículo; la clave es la ruta del .md dentro del proyecto.
const pages = import.meta.glob<ContentPage | null>('/content/**/*.md', { query: '?page', import: 'default' });

const loadPage = async (meta: ContentMeta | undefined) => {
  const loader = meta && pages[`/content/${meta.id}`];
  return loader ? await loader() : null;
};

/**
 * Metadata + cuerpo renderizado de la entrada cuya URL es `url`, con el
 * <head> (title, description, og:*) ya configurado.
 *
 * Debe llamarse con `await` dentro de un `<script setup>` (Suspense) para que
 * vite-ssg prerenderice el cuerpo y no haya desajuste de hidratación.
 */
export async function useContentPage(url: Ref<string>) {
  const meta = computed(() => findByUrl(url.value));

  // useHead ANTES del await: tras un await dentro de un composable ya no hay
  // instancia de componente activa.
  useHead(computed(() => {
    const m = meta.value;
    if (!m) return { title: siteConfig.name };
    const absolute = (p?: string) => (p ? (p.startsWith('http') ? p : siteConfig.url + p) : undefined);
    return {
      title: m.title,
      meta: [
        { name: 'description', content: m.abstract ?? siteConfig.description },
        { name: 'keywords', content: m.tags.join(', ') },
        ...(m.author ? [{ name: 'author', content: m.author }] : []),
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: m.title },
        { property: 'og:description', content: m.abstract ?? siteConfig.description },
        { property: 'og:url', content: siteConfig.url + m.url },
        ...(m.image ? [{ property: 'og:image', content: absolute(m.image)! }] : []),
        { property: 'article:published_time', content: m.date },
        ...m.tags.map(t => ({ property: 'article:tag', content: t })),
      ],
      link: [{ rel: 'canonical', href: siteConfig.url + m.url }],
    };
  }));

  const page = ref<ContentPage | null>(await loadPage(meta.value));
  const loading = ref(false);
  const notFound = computed(() => !meta.value || page.value === null);

  // Navegación entre entradas que reutilizan el mismo componente de página
  watch(url, async () => {
    loading.value = true;
    try {
      page.value = await loadPage(meta.value);
    } finally {
      loading.value = false;
    }
  });

  return { meta, page, loading, notFound };
}
