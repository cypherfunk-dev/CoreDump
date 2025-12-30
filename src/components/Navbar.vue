<script setup lang="ts">
import { useUiStore } from '../stores/ui';
import siteTexts from '../database/site-texts.json';
import { watch, ref, nextTick } from 'vue';
import { computed,  } from 'vue';
import { useRoute } from 'vue-router';
const ui = useUiStore();
const searchField = ref(null);
const route = useRoute();
const isSearchPage = computed (() => {
    return route.fullPath.startsWith('/search/');
});


watch(isSearchPage, (newValue) => {
    if (newValue) {
        console.log(newValue);
        nextTick(() => {
            (searchField.value as any)?.focus();
        });
    }
}, { immediate: true }
);



watch(() => ui.searchbar, (newValue) => {
    if (newValue) {
        nextTick(() => {
            (searchField.value as any)?.focus();
        });
    }
});
</script>

<template>
    <v-app-bar app :elevation="2" class="bg-darken-4">
        <v-app-bar-title class="ml-4 ">
            <span class="text-green-accent-3 font-weight-bold mr-1">
                &gt;
            </span>
            <RouterLink style="text-decoration: none; color: inherit;" to="/">
                <span class="text-h5 font-weight-bold spacing-title">{{ siteTexts.siteName }}</span>
            </RouterLink>
        </v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click.stop="ui.toggleSearch" class="mr-1" v-if="!isSearchPage">
            <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon @click="ui.toggleSideBar">
            <v-icon>{{ ui.sidebar ? 'mdi-page-last' : 'mdi-page-first' }}</v-icon>
        </v-btn>
    </v-app-bar>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   NAVBAR - Estilos refinados
   ═══════════════════════════════════════════════════════════ */

.v-app-bar {
  backdrop-filter: blur(12px) saturate(180%);
  background: rgba(18, 18, 18, 0.85) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.v-app-bar-title .spacing-title {
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.15em !important;
  font-size: 1.15rem !important;
  font-weight: 700;
  white-space: normal !important;
  overflow: visible !important;
  max-width: none !important;
  word-break: break-word !important;
}
@media screen and (max-width: 404px) {
  .v-app-bar-title .spacing-title {
    font-size: 0.9rem !important;
    letter-spacing: 0.1em !important;
      white-space: nowrap !important;
  overflow: visible !important;
  max-width: none !important;
  word-break: break-word !important;
  }
  
}

/* Cursor verde animado */
.text-green-accent-3 {
  animation: blink 1.2s step-end infinite;
  font-size: 1.1rem;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Botones de acción */
:deep(.v-btn--icon) {
  transition: background-color 0.25s ease, transform 0.2s ease;
}

:deep(.v-btn--icon:hover) {
  background-color: rgba(105, 240, 174, 0.12) !important;
  transform: scale(1.08);
}

:deep(.v-btn--icon .v-icon) {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.2s ease;
}

:deep(.v-btn--icon:hover .v-icon) {
  color: #69F0AE;
}
</style>