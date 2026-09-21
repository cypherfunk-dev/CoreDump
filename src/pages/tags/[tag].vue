<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import { allContent } from '@/stores/ui';
import ArticleList from '@/components/ArticleList.vue';
import NotFound from '@/components/NotFound.vue';
import { useTexts } from '@/utils/i18n';

const route = useRoute('/tags/[tag]');
const texts = useTexts();
const tag = computed(() => decodeURIComponent(String(route.params.tag)));
const items = computed(() => allContent.filter(m => m.tags.includes(tag.value)));

useHead({ title: computed(() => `#${tag.value}`) });
</script>

<template>
  <v-container class="listing-page">
    <NotFound v-if="!items.length" />
    <template v-else>
      <p class="listing-kicker">{{ texts.tagPageTitle }}</p>
      <h1 class="listing-title">#{{ tag }}</h1>
      <router-link to="/tags" class="listing-back">{{ texts.allTags }} →</router-link>
      <ArticleList :items="items" class="mt-6" />
    </template>
  </v-container>
</template>
