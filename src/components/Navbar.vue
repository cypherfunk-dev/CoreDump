<script setup lang="ts">
import { useUiStore } from '../stores/ui';

const ui = useUiStore();
</script>

<template>
        <v-app-bar app :elevation="2" class="bg-darken-4">
            <v-app-bar-title class="ml-4 ">
                <span class="text-green-accent-3 font-weight-bold mr-1">
                    &gt;
                </span>
                <RouterLink style="text-decoration: none; color: inherit;" to="/">
                <span class="text-h5 font-weight-bold spacing-title" >.txt del soporte</span>
                </RouterLink>   
            </v-app-bar-title>
            <v-spacer></v-spacer>
            <v-expand-x-transition>
                
                <div 
                    v-if="ui.searchbar" 
                    v-click-outside="ui.onClickOutside"
                    style="width: 500px;" 
                    class="mr-2"
                >
                    <VTextField 
                        v-model="ui.search" 
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

            <v-btn icon @click.stop="ui.toggleSearch" class="mr-1">
                <v-icon>{{ ui.searchbar ? 'mdi-close' : 'mdi-magnify' }}</v-icon>
            </v-btn>

            <v-btn icon @click="ui.toggleSideBar">
            <v-icon >{{ ui.sidebar ? 'mdi-page-last' : 'mdi-page-first' }}</v-icon>
            </v-btn>
        </v-app-bar>
</template>

<style scoped>
/* Estilos para espaciar las letras del título */
.v-app-bar-title .spacing-title {
        letter-spacing: 0.2em !important; 
}
</style>