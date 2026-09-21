<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import { allContent } from '@/stores/ui';
import ArticleList from '@/components/ArticleList.vue';
import NotFound from '@/components/NotFound.vue';
import { useTexts } from '@/utils/i18n';

const route = useRoute('/categories/[category]');
const texts = useTexts();
const category = computed(() => decodeURIComponent(String(route.params.category)));
const items = computed(() => allContent.filter(m => m.category === category.value));

useHead({ title: category });
</script>

<template>
  <v-container class="listing-page">
    <NotFound v-if="!items.length" />
    <template v-else>
      <p class="listing-kicker">{{ texts.categoryPageTitle }}</p>
      <h1 class="listing-title">{{ category }}</h1>
      <router-link to="/categories" class="listing-back">{{ texts.allCategories }} →</router-link>
      <ArticleList :items="items" class="mt-6" />
    </template>
  </v-container>
</template>
