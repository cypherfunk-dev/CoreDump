<script setup lang="ts">
import { useUiStore } from '../stores/ui';
import siteTexts from '../database/site-texts.json';
import { watch, ref, nextTick } from 'vue';

const ui = useUiStore();
const searchField = ref(null);

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
        <v-btn icon @click.stop="ui.toggleSearch" class="mr-1">
            <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon @click="ui.toggleSideBar">
            <v-icon>{{ ui.sidebar ? 'mdi-page-last' : 'mdi-page-first' }}</v-icon>
        </v-btn>
    </v-app-bar>
</template>

<style scoped>
/* Estilos para espaciar las letras del título */
.v-app-bar-title .spacing-title {
    letter-spacing: 0.2em !important;
}
</style>