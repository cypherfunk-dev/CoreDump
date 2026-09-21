<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useContentPage } from '@/composables/useContentPage';
import { docs } from '@/stores/ui';
import ArticleView from '@/components/ArticleView.vue';
import DocsNav from '@/components/DocsNav.vue';
import NotFound from '@/components/NotFound.vue';
import { useTexts } from '@/utils/i18n';

const route = useRoute('/docs/[...path]');
const texts = useTexts();
const url = computed(() => `/docs/${route.params.path}`);
const { meta, page, loading, notFound } = await useContentPage(url);

// Orden del árbol de docs (sección → order → título)
const index = computed(() => docs.findIndex(d => d.url === url.value));
const prev = computed(() => (index.value > 0 ? docs[index.value - 1] : undefined));
const next = computed(() => (index.value >= 0 ? docs[index.value + 1] : undefined));
</script>

<template>
  <v-container fluid class="markdown-container">
    <div class="docs-layout">
      <DocsNav class="docs-nav" />
      <div class="markdown-view">
        <NotFound v-if="notFound || !meta || !page" :message="texts.articleNotFound" />
        <ArticleView v-else :meta="meta" :page="page" :loading="loading" :prev="prev" :next="next" />
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.docs-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 32px;
}

.docs-nav {
  position: sticky;
  top: 80px;
  align-self: start;
}

@media (max-width: 960px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
  .docs-nav {
    position: static;
  }
}
</style>
