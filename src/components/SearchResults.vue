<script setup lang="ts">
import { useUiStore } from '../stores/ui';
import siteTexts from '../database/site-texts.json';
import { ref, watch, nextTick } from 'vue';
import dateParser from '../utils/dateparser';
const ui = useUiStore();
const searchField = ref<{ focus: () => void } | null>(null);

// Enfocar el campo al abrir el modal
watch(() => ui.searchbar, (open) => {
    if (open) nextTick(() => searchField.value?.focus());
}, { immediate: true });
</script>

<template>
    <v-container>
        <v-card>
            <v-card-title>
                <v-text-field ref="searchField" v-model="ui.search" density="compact"
                    :placeholder="siteTexts.searchPlaceholder" variant="solo-filled" flat single-line hide-details
                    autofocus />
            </v-card-title>
        </v-card>

        <div v-if="ui.results.length" class="overflow-y-auto" style="max-height: 70vh; padding: 16px 0;">
            <v-container v-for="result in ui.results" :key="result.slug" class="mt-0">
                <v-card :title="result['metadata.title']"
                    :subtitle="dateParser().format(new Date(result['metadata.date']))">
                    <v-card-text>
                        {{ result['metadata.abstract'] }}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn :to="result.slug" @click="ui.searchbar = false">{{ siteTexts.readMore }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-container>
        </div>
    </v-container>
</template>
