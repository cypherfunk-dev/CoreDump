<script setup lang="ts">
import { useUiStore } from '../stores/ui';
import siteTexts from '../database/site-texts.json';
import { ref } from 'vue';
const ui = useUiStore();
const searchField = ref(null);
import dateParser from '../utils/dateparser';
</script>



<template>
<v-container  >
    <v-card >
            <v-card-title>
                <VTextField ref="searchField" v-model="ui.search" density="compact"
                    :placeholder="siteTexts.searchPlaceholder" variant="solo-filled" flat single-line hide-details
                    @input="ui.queryChange(ui.search)" />
            </v-card-title>
        </v-card>

        <div class="overflow-y-auto" style="max-height: 70vh; padding: 16px 0; background-color: black;"
            v-if="ui.queryChange(ui.search).length">
            <v-container v-for="result in ui.queryChange(ui.search)" :key="result.slug" class="mt-0">
                <v-card :title="result['metadata.title']"
                    :subtitle="dateParser().format(new Date(result['metadata.date']))">
                    <v-card-text>
                        {{ result['metadata.abstract'] }}
                    </v-card-text>
                    <v-card-actions>
                        <router-link :to="result.slug" @click="ui.searchbar = false">
                            <v-btn>{{ siteTexts.readMore }}</v-btn>
                        </router-link>
                    </v-card-actions>
                </v-card>
            </v-container>
            <v-card class="mx-4 my-2" outlined>
            </v-card>
                    <v-card>
                        
        </v-card>
        </div>
    </v-container>


</template>