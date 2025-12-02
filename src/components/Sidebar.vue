<script setup lang="ts">
import { useUiStore } from '../stores/ui';
import { ref } from 'vue';
import database from '../database/articles-db.json';
import usersdb from '../database/authors.json';

const user = ref(usersdb[0]);
const ui = useUiStore();
const timeformat = () => new Intl.DateTimeFormat('es-ES', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
});

</script>

<template>
  <v-navigation-drawer app location="right" :width="470" v-model="ui.sidebar" class="bg-darken-4"
    style="overflow-y: auto !important">
    <v-list dense>
      <v-img :width="300" aspect-ratio="16/9" cover class="mx-auto" src="../assets/avatar.png"></v-img>
      <v-list-item class="text-center">
        <v-list-item-title class="sidebar-title ">{{ user?.name }}</v-list-item-title>
        <p class="sidebar-subtitle">{{ user?.bio }}</p>
        <v-container class="social-icons">
          <v-btn key="mdi-linkedin" v-if="user?.linkedin" :href="`https://linkedin.com/in/${user?.linkedin}`" icon class="mx-2" color="blue darken-1"
            target="_blank">
            <v-icon>mdi-linkedin</v-icon>
          </v-btn>
          <v-btn key="mdi-github" v-if="user?.github" :href="`https://github.com/${user?.github}`" icon class="mx-2" color="grey darken-4"
            target="_blank">
            <v-icon>mdi-github</v-icon>
          </v-btn>
          <v-btn key="mdi-twitter" v-if="user?.twitter" :href="`https://twitter.com/${user?.twitter}`" icon class="mx-2" color="blue lighten-2"
            target="_blank">
            <v-icon>mdi-twitter</v-icon>
          </v-btn>
          <v-btn key="mdi-mail" v-if="user?.email" :href="`mailto:${user?.email}`" icon class="mx-2" color="red lighten-2"
            target="_blank">
            <v-icon>mdi-mail</v-icon>
          </v-btn>
        </v-container>
      </v-list-item>
    </v-list>
    <v-divider class="my-2 separator" />
    <!-- card con nube de tags de categorias populares -->
    <v-card class="mx-14 my-8 tagscloud " outlined>
      <v-card-title class="sidebar-title ">Nube de tags</v-card-title>
      <v-card-text>
        <v-chip-group column>
          <v-chip class="ma-1 tag" >#Backend</v-chip>
          <v-chip class="ma-1 tag" >#Frontend</v-chip>
          <v-chip class="ma-1 tag" >#DevOps</v-chip>
          <v-chip class="ma-1 tag" >#Infraestructura</v-chip>
          <v-chip class="ma-1 tag" >#Bases de Datos</v-chip>
          <v-chip class="ma-1 tag" >#Seguridad</v-chip>
          <v-chip class="ma-1 tag" >#Redes</v-chip>
          <v-chip class="ma-1 tag" >#Sistemas Operativos</v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-divider class="my-2 separator" />

    <v-list-item>
      <v-list-item-title class="sidebar-title">Artículos Recientes</v-list-item-title>
      <v-list-item-subtitle>
        <div v-for="articulo in database" :key="articulo.metadata?.title">
          <router-link :to="articulo.slug" class="recent-articles">
            <div class="title">{{ articulo.metadata?.title }}</div>

            <div class="subtitle">
              {{ timeformat().format(new Date(articulo.metadata?.date)) }} </div>

            <v-divider v-if="articulo !== database[database.length - 1]" class="my-2 separator" />
          </router-link>
        </div>
      </v-list-item-subtitle>
    </v-list-item>

  </v-navigation-drawer>
</template>