<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useContentPage } from '@/composables/useContentPage';
import ArticleView from '@/components/ArticleView.vue';
import NotFound from '@/components/NotFound.vue';

// Páginas sueltas (content/pages/<slug>.md → /<slug>). Las rutas estáticas
// (/docs, /tags, /search…) tienen prioridad sobre esta.
const route = useRoute('/[page]');
const url = computed(() => `/${route.params.page}`);
const { meta, page, loading, notFound } = await useContentPage(url);
</script>

<template>
  <v-container fluid class="markdown-container">
    <div class="markdown-view">
      <NotFound v-if="notFound || !meta || !page || meta.kind !== 'page'" />
      <ArticleView v-else :meta="meta" :page="page" :loading="loading" compact />
    </div>
  </v-container>
</template>
