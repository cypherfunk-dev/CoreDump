<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useTheme } from 'vuetify';
import { siteConfig } from '@/site.config';

// Comentarios vía giscus (GitHub Discussions): sin backend, el hilo vive en el
// repo configurado. Se remonta por artículo con :key en el padre.
const { comments } = siteConfig;
const container = ref<HTMLElement | null>(null);
const theme = useTheme();
// El tema de giscus sigue al de la UI (`comments.theme` solo aplica en oscuro).
const giscusTheme = () => (theme.global.name.value === 'dark' ? comments.theme : 'light');

watch(() => theme.global.name.value, () => {
  const frame = container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
  frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, 'https://giscus.app');
});

onMounted(() => {
  if (!comments.enabled || !container.value) return;
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  Object.entries({
    'data-repo': comments.repo,
    'data-repo-id': comments.repoId,
    'data-category': comments.category,
    'data-category-id': comments.categoryId,
    'data-mapping': comments.mapping,
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': giscusTheme(),
    'data-lang': comments.lang,
    'data-loading': 'lazy',
  }).forEach(([k, v]) => script.setAttribute(k, v));
  container.value.appendChild(script);
});
</script>

<template>
  <section v-if="comments.enabled" ref="container" class="comments mt-12" aria-label="Comentarios" />
</template>

<style scoped>
.comments {
  max-width: 900px;
  margin-inline: auto;
}
</style>
