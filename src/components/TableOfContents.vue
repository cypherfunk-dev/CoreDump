<script setup lang="ts">
import type { TocEntry } from '@/content/types';
import { useTexts } from '@/utils/i18n';

defineProps<{ toc: TocEntry[] }>();
const texts = useTexts();
</script>

<template>
  <nav class="toc" :aria-label="texts.onThisPage">
    <p class="toc-title">{{ texts.onThisPage }}</p>
    <ul>
      <li v-for="entry in toc" :key="entry.id" :class="`toc-level-${entry.level}`">
        <a :href="`#${entry.id}`">{{ entry.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.toc {
  font-size: 0.85rem;
  border-left: 2px solid rgba(var(--v-theme-on-surface), 0.1);
  padding-left: 16px;
}

.toc-title {
  font-family: var(--font-heading);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.6;
  margin: 0 0 8px;
}

.toc ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc li {
  margin: 4px 0;
}

.toc-level-3 {
  padding-left: 12px;
}

.toc a {
  color: inherit;
  opacity: 0.75;
  text-decoration: none;
}

.toc a:hover {
  opacity: 1;
  color: rgb(var(--v-theme-primary));
}
</style>
