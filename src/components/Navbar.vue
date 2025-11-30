<script setup lang="ts">
import { ref } from 'vue';
const searchbar = ref(false);
const search = ref('');
const toggleSearch = () => {
    searchbar.value = !searchbar.value;
};

const onClickOutside = () => {
    if (searchbar.value) {
        searchbar.value = false;
    }
}
</script>

<template>
        <v-app-bar app :elevation="2" class="bg-darken-4">
            <v-app-bar-title class="ml-4 ">
                <span class="text-green-accent-3 font-weight-bold mr-1">
                    &gt;
                </span>
                <span class="text-h5 font-weight-bold spacing-title">.txt del soporte</span>
            </v-app-bar-title>
            <v-spacer></v-spacer>
            <v-expand-x-transition>
                
                <div 
                    v-if="searchbar" 
                    v-click-outside="onClickOutside"
                    style="width: 500px;" 
                    class="mr-2"
                >
                    <VTextField 
                        v-model="search" 
                        density="compact" 
                        placeholder="Buscar comando, error o solución... (Ctrl + K)"
                        variant="solo-filled" 
                        flat 
                        single-line 
                        hide-details 
                        autofocus
                    />
                </div>
            </v-expand-x-transition>

            <v-btn icon @click.stop="toggleSearch" class="mr-1">
                <v-icon>{{ searchbar ? 'mdi-close' : 'mdi-magnify' }}</v-icon>
            </v-btn>
            <v-app-bar-nav-icon class="mr-4"></v-app-bar-nav-icon>
        </v-app-bar>
</template>

<style scoped>
/* Estilos para espaciar las letras del título */
.v-app-bar-title .spacing-title {
        letter-spacing: 0.2em !important; 
}
</style>