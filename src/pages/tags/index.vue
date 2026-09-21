<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { tagCounts } from '@/stores/ui';
import { useTexts } from '@/utils/i18n';

const texts = useTexts();
useHead({ title: texts.allTags });
</script>

<template>
  <v-container class="listing-page">
    <h1 class="listing-title">{{ texts.allTags }}</h1>
    <div class="cloud mt-6">
      <v-chip
        v-for="[tag, count] in tagCounts"
        :key="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
        class="ma-1"
        variant="tonal"
      >
        #{{ tag }} <span class="ml-2 text-medium-emphasis">{{ count }}</span>
      </v-chip>
    </div>
  </v-container>
</template>
