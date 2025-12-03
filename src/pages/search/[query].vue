<script lang="ts" setup>
import { useUiStore } from '../../stores/ui';
import { useRoute } from 'vue-router';
import SearchBar from '@/components/SearchBar.vue';
import SearchResults from '@/components/SearchResults.vue';
const ui = useUiStore();
const route = useRoute();
const query = route.params.query as string;
</script>

<template>
    <SearchBar />
    {{ ui.queryChange(query).length }} results found for "{{ query }}"
    <SearchResults />
</template>