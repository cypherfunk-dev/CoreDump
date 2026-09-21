<script lang="ts" setup>
import { useUiStore } from '../stores/ui';
import { useTexts } from '@/utils/i18n';
const texts = useTexts();
import SearchResults from './SearchResults.vue';
const ui = useUiStore();
</script>

<template>
    <v-dialog v-model="ui.searchbar" transition="dialog-top-transition" opacity="0.85" max-width="800">
        <SearchResults />
        <v-card-text v-if="!ui.results.length" class="text-center text-medium-emphasis">
            {{ !ui.searchReady ? texts.searchLoading : ui.search.trim() ? texts.noResultsFound : texts.searchInstructions }}
        </v-card-text>
        <v-card class="mt-15">
            <v-card-text class="text-center">
                <router-link :to="`/search/${encodeURIComponent(ui.search)}`" @click="ui.searchbar = false">
                    {{ texts.advancedSearch }}
                </router-link>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
