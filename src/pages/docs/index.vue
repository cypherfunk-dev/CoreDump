<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { docsNav, docs } from '@/stores/ui';
import DocsNav from '@/components/DocsNav.vue';
import { useTexts } from '@/utils/i18n';

const texts = useTexts();
useHead({ title: texts.docsIndexTitle });
</script>

<template>
  <v-container fluid class="markdown-container">
    <div class="markdown-view">
      <h1>{{ texts.docsIndexTitle }}</h1>
      <p v-if="!docs.length" class="text-medium-emphasis">
        {{ texts.docsEmpty }} <code>content/docs/&lt;seccion&gt;/</code>
      </p>
      <DocsNav v-else :nodes="docsNav" expanded />
    </div>
  </v-container>
</template>
