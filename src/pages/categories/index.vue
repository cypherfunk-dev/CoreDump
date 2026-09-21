<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { categoryCounts } from '@/stores/ui';
import { useTexts } from '@/utils/i18n';

const texts = useTexts();
useHead({ title: texts.allCategories });
</script>

<template>
  <v-container class="listing-page">
    <h1 class="listing-title">{{ texts.allCategories }}</h1>
    <v-list class="mt-4" bg-color="transparent">
      <v-list-item
        v-for="[category, count] in categoryCounts"
        :key="category"
        :to="`/categories/${encodeURIComponent(category)}`"
        :title="category"
        :subtitle="`${count}`"
        rounded
      />
    </v-list>
  </v-container>
</template>
