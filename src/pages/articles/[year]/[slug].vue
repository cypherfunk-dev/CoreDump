<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import { computed, ref, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import timeformat from '@/utils/dateparser';
import { useUiStore, findArticle } from '@/stores/ui';
import siteTexts from '@/database/site-texts.json';

const ui = useUiStore();
const route = useRoute();
const md = new MarkdownIt({
    html: false,       // sin HTML embebido en los .md (XSS)
    linkify: true,
    typographer: true,
});
const originalTitle = document.title;

const htmlContent = ref('');
const error = ref<string | null>(null);

// La metadata ya está indexada en db.json: no hace falta re-parsear el frontmatter.
const article = computed(() => findArticle(`/articles/${route.params.year}/${route.params.slug}`));
const meta = computed(() => article.value?.metadata);
const tags = computed(() => (meta.value?.tags ?? '').split(',').map(t => t.trim()).filter(Boolean));
const dateLabel = computed(() => meta.value ? timeformat().format(new Date(meta.value.date)) : '');

const FRONTMATTER = /^---\s*[\s\S]*?\s*---\s*/;

// SEO: título y meta tags por artículo (SPA, así que se hace en cliente).
const setMeta = (name: string, content: string | undefined, property = false) => {
    if (!content) return;
    const attr = property ? 'property' : 'name';
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.content = content;
};

watch(meta, (m) => {
    if (!m) return;
    document.title = `${m.title} | ${siteTexts.siteName}`;
    setMeta('description', m.abstract);
    setMeta('keywords', tags.value.join(', '));
    setMeta('author', m.author);
    setMeta('og:title', m.title, true);
    setMeta('og:description', m.abstract, true);
    setMeta('og:type', 'article', true);
    setMeta('og:image', m.image, true);
}, { immediate: true });

onUnmounted(() => { document.title = originalTitle; });

const loadContent = async (year: string, slug: string) => {
    error.value = null;
    htmlContent.value = '';
    // Si no está en el índice no existe: evitamos el fetch (el fallback SPA
    // devolvería index.html con 200 y se renderizaría como Markdown).
    if (!article.value) {
        error.value = siteTexts.articleNotFound;
        return;
    }
    try {
        const response = await fetch(`/markdowns/${year}/${slug}.md`);
        if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
            throw new Error(`HTTP ${response.status}`);
        }
        const content = await response.text();
        htmlContent.value = md.render(content.replace(FRONTMATTER, ''));
    } catch (e) {
        error.value = siteTexts.articleNotFound;
    }
};

watch(
    () => [route.params.year, route.params.slug] as [string, string],
    ([year, slug]) => {
        if (!year || !slug) return;
        ui.onloading(true);
        loadContent(year, slug).finally(() => ui.onloading(false));
    },
    { immediate: true }
);
</script>

<template>
    <v-container fluid class="markdown-container">
        <div class="markdown-view">
            <h1>{{ meta?.title }}</h1>
            <div class="metadata-container pb-10">
                <div v-if="meta">
                    <div>
                        <span class="font-weight-bold">Escrito por: </span>
                        <span class="lastlinemetadata">{{ meta.author }}</span>
                    </div>
                    <div>
                        <span class="font-weight-bold">Subido un: </span>
                        <span class="lastlinemetadata">{{ dateLabel }}</span>
                    </div>
                    <div>
                        <span class="font-weight-bold">Resumen: </span>
                        <span class="lastlinemetadata">{{ meta.abstract }}</span>
                    </div>
                    <div>
                        <span class="font-weight-bold">Etiquetas: </span>
                        <router-link v-for="tag in tags" :key="tag" :to="`/search/${encodeURIComponent(tag)}`"
                            class="mr-2">#{{ tag }}</router-link>
                    </div>
                </div>
                <div v-else-if="!ui.loading">
                    <em>No metadata available.</em>
                </div>
            </div>

            <v-progress-circular v-if="ui.loading" color="primary" indeterminate />
            <div v-else-if="error" class="text-center py-10">
                <p class="mb-4">{{ error }}</p>
                <v-btn to="/" variant="outlined">{{ siteTexts.goBackHome }}</v-btn>
            </div>
            <article v-else class="markdown-content" v-html="htmlContent" />
        </div>
    </v-container>
</template>
