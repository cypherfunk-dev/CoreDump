<script lang="ts" setup>
import { useUiStore } from '../stores/ui';
import siteTexts from '../database/site-texts.json';
const ui = useUiStore();
import SearchResults from './SearchResults.vue';

</script>
<template>
    <v-dialog v-model="ui.searchbar" v-if="ui.searchbar" transition="dialog-top-transition" opacity="0.85"
        max-width="800">
        <SearchResults />
        <v-card-text class="text-center grey--text text--darken-1">
        {{
            ui.queryChange(ui.search).length < 1 ? (ui.search.length < 1 ? siteTexts.searchInstructions :
                siteTexts.noResultsFound) : null }} 
        </v-card-text>
            <v-card class="mt-15" outlined >
            <v-card-text class="text-center" v-if="ui.search.length > 0 ? siteTexts.noResultsFound : siteTexts.searchInstructions">

                <router-link :to="`/search/${ui.search}`" @click="ui.searchbar = false" >
                    {{ siteTexts.advancedSearch }}
                </router-link>
            </v-card-text>
            </v-card>

    </v-dialog>
</template>