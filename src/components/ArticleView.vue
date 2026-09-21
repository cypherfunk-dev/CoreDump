<script setup lang="ts">
import { computed } from 'vue';
import type { ContentMeta, ContentPage } from '@/content/types';
import { formatDate } from '@/utils/dateparser';
import { t, useTexts } from '@/utils/i18n';
import Comments from '@/components/Comments.vue';
import TableOfContents from '@/components/TableOfContents.vue';

const props = defineProps<{
  meta: ContentMeta;
  page: ContentPage;
  loading?: boolean;
  prev?: ContentMeta;
  next?: ContentMeta;
  /** Páginas sueltas: sin bloque de metadata ni comentarios */
  compact?: boolean;
}>();

const texts = useTexts();
const dateLabel = computed(() => formatDate(props.meta.date));
const showToc = computed(() => props.page.toc.length >= 2);
</script>

<template>
  <div class="article-view">
    <header class="article-header">
      <v-chip v-if="meta.draft" color="warning" size="small" variant="flat" class="mb-3">{{ texts.draft }}</v-chip>
      <h1>{{ meta.title }}</h1>

      <div v-if="!compact" class="metadata-container">
        <div v-if="meta.author">
          <span class="font-weight-bold">{{ texts.writtenBy }}: </span>
          <span class="lastlinemetadata">{{ meta.author }}</span>
        </div>
        <div>
          <span class="font-weight-bold">{{ texts.publishedOn }}: </span>
          <span class="lastlinemetadata">{{ dateLabel }}</span>
          <span class="text-medium-emphasis"> · {{ t('readingTime', { minutes: meta.readingTime }) }}</span>
        </div>
        <div v-if="meta.category">
          <span class="font-weight-bold">{{ texts.category }}: </span>
          <router-link :to="`/categories/${encodeURIComponent(meta.category)}`">{{ meta.category }}</router-link>
        </div>
        <div v-if="meta.abstract">
          <span class="font-weight-bold">{{ texts.summary }}: </span>
          <span class="lastlinemetadata">{{ meta.abstract }}</span>
        </div>
        <div v-if="meta.tags.length">
          <span class="font-weight-bold">{{ texts.tags }}: </span>
          <router-link v-for="tag in meta.tags" :key="tag" :to="`/tags/${encodeURIComponent(tag)}`" class="mr-2">
            #{{ tag }}
          </router-link>
        </div>
      </div>
    </header>

    <div class="article-layout" :class="{ 'has-toc': showToc }">
      <TableOfContents v-if="showToc" :toc="page.toc" class="article-toc" />
      <v-progress-linear v-if="loading" indeterminate color="primary" />
      <article class="markdown-content" v-html="page.html" />
    </div>

    <nav v-if="prev || next" class="article-pager" aria-label="Paginación">
      <router-link v-if="prev" :to="prev.url" class="pager-link pager-prev">
        <span class="pager-label">← {{ texts.previous }}</span>
        <span class="pager-title">{{ prev.title }}</span>
      </router-link>
      <span v-else />
      <router-link v-if="next" :to="next.url" class="pager-link pager-next">
        <span class="pager-label">{{ texts.next }} →</span>
        <span class="pager-title">{{ next.title }}</span>
      </router-link>
    </nav>

    <Comments v-if="meta.comments && !compact" :key="meta.url" />
  </div>
</template>

<style scoped>
.article-layout {
  display: grid;
  gap: 32px;
}

.article-layout.has-toc {
  grid-template-columns: minmax(0, 1fr) 240px;
}

.article-toc {
  order: 2;
  position: sticky;
  top: 80px;
  align-self: start;
}

@media (max-width: 1100px) {
  .article-layout.has-toc {
    grid-template-columns: 1fr;
  }
  .article-toc {
    order: 0;
    position: static;
  }
}

.article-pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.pager-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: border-color 0.2s;
}

.pager-link:hover {
  border-color: rgb(var(--v-theme-primary));
}

.pager-next {
  text-align: right;
}

.pager-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.6;
}

.pager-title {
  font-weight: 600;
}
</style>
