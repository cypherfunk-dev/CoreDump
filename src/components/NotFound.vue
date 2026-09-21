<script setup lang="ts">
import { useHead } from '@unhead/vue';
import image from '@/assets/404.webp';
import { useTexts } from '@/utils/i18n';

const props = defineProps<{ message?: string }>();
const texts = useTexts();
useHead({ title: props.message ?? texts.pageNotFound, meta: [{ name: 'robots', content: 'noindex' }] });
</script>

<template>
  <div class="text-center py-10">
    <v-img :src="image" max-width="500" class="mx-auto mb-6" alt="404" />
    <p class="mb-4">{{ message ?? texts.pageNotFound }}</p>
    <v-btn to="/" variant="outlined">{{ texts.goBackHome }}</v-btn>
  </div>
</template>
