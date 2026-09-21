<script setup lang="ts">
import type { ContentMeta } from '@/content/types';
import { formatDate } from '@/utils/dateparser';
import { useTexts } from '@/utils/i18n';

defineProps<{ items: ContentMeta[] }>();
const texts = useTexts();
</script>

<template>
  <div class="article-list">
    <router-link v-for="item in items" :key="item.url" :to="item.url" class="article-list-item">
      <v-img v-if="item.image" :src="item.image" :srcset="item.imageSrcset" sizes="(max-width: 600px) 100vw, 180px"
        :alt="item.title" cover class="article-list-image" />
      <div class="article-list-body">
        <div class="article-list-meta">
          <span v-if="item.category" class="article-list-category">{{ item.category }}</span>
          <span v-if="item.kind === 'doc'" class="article-list-category">{{ texts.docs }}</span>
          <span>{{ formatDate(item.date) }}</span>
        </div>
        <h2 class="article-list-title">{{ item.title }}</h2>
        <p v-if="item.abstract" class="article-list-abstract">{{ item.abstract }}</p>
        <div v-if="item.tags.length" class="article-list-tags">
          <span v-for="tag in item.tags" :key="tag">#{{ tag }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-list-item {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 20px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgba(var(--v-theme-on-surface), 0.02);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s;
}

.article-list-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateY(-2px);
}

.article-list-item:not(:has(.article-list-image)) {
  grid-template-columns: 1fr;
}

.article-list-image {
  border-radius: 8px;
  aspect-ratio: 4 / 3;
}

.article-list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 6px;
}

.article-list-category {
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.article-list-title {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.3;
}

.article-list-abstract {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-list-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.75rem;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .article-list-item {
    grid-template-columns: 1fr;
  }
}
</style>
