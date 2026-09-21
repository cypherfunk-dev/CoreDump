<script setup lang="ts">
import { useUiStore } from '../stores/ui';
import { siteConfig } from '@/site.config';
import { docs } from '@/stores/ui';
import { useTexts } from '@/utils/i18n';
import { useThemeToggle } from '@/plugins/theme';
const texts = useTexts();
const { theme, toggle } = useThemeToggle();
const hasDocs = docs.length > 0;
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const ui = useUiStore();
const route = useRoute();
const isSearchPage = computed(() => route.path.startsWith('/search'));
</script>

<template>
    <v-app-bar app :elevation="2">
        <v-app-bar-title class="ml-4 ">
            <span class="text-green-accent-3 font-weight-bold mr-1">
                &gt;
            </span>
            <RouterLink style="text-decoration: none; color: inherit;" to="/">
                <span class="text-h5 font-weight-bold spacing-title">{{ siteConfig.name }}</span>
            </RouterLink>
        </v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="hasDocs" to="/docs" variant="text" class="mr-1 d-none d-sm-flex">{{ texts.docs }}</v-btn>
        <v-btn v-for="link in siteConfig.nav" :key="link.to" :to="link.to" variant="text" class="mr-1 d-none d-sm-flex">
            {{ link.label }}
        </v-btn>
        <v-btn icon @click.stop="ui.toggleSearch" class="mr-1" v-if="!isSearchPage">
            <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon @click="toggle" :aria-label="texts.themeToggle" class="mr-1">
            <v-icon>{{ theme.global.name.value === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
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
  background: rgba(var(--v-theme-surface), 0.85) !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.v-app-bar-title .spacing-title {
  font-family: var(--font-heading);
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
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  transform: scale(1.08);
}

:deep(.v-btn--icon .v-icon) {
  color: rgba(var(--v-theme-on-surface), 0.8);
  transition: color 0.2s ease;
}

:deep(.v-btn--icon:hover .v-icon) {
  color: rgb(var(--v-theme-primary));
}
</style>