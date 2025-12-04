<script setup lang="ts">
import siteTexts from '../database/site-texts.json';
</script>

<template>
  <v-footer class="bg-darken-4">
    <v-col class="text-center white--text">
      {{ siteTexts.siteName }}
    </v-col>
  </v-footer>
</template>