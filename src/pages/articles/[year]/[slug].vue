<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useContentPage } from '@/composables/useContentPage';
import { posts } from '@/stores/ui';
import ArticleView from '@/components/ArticleView.vue';
import NotFound from '@/components/NotFound.vue';
import { useTexts } from '@/utils/i18n';

const route = useRoute('/articles/[year]/[slug]');
const texts = useTexts();
const url = computed(() => `/articles/${route.params.year}/${route.params.slug}`);
const { meta, page, loading, notFound } = await useContentPage(url);

// Posts ordenados del más reciente al más antiguo: "anterior" es el más nuevo.
const index = computed(() => posts.findIndex(p => p.url === url.value));
const prev = computed(() => (index.value > 0 ? posts[index.value - 1] : undefined));
const next = computed(() => (index.value >= 0 ? posts[index.value + 1] : undefined));
</script>

<template>
  <v-container fluid class="markdown-container">
    <div class="markdown-view">
      <NotFound v-if="notFound || !meta || !page" :message="texts.articleNotFound" />
      <ArticleView v-else :meta="meta" :page="page" :loading="loading" :prev="prev" :next="next" />
    </div>
  </v-container>
</template>
