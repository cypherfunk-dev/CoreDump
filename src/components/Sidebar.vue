<script setup lang="ts">
import { useUiStore } from '../stores/ui';
import { ref } from 'vue';
import database from '../database/db.json';
import usersdb from '../database/authors.json';
import timeformat from '../utils/dateparser';
import type { RouterLink } from 'vue-router';

const user = ref(usersdb[0]);
const ui = useUiStore();
</script>

<template>
  <v-navigation-drawer app location="right" :width="470" v-model="ui.sidebar" class="bg-darken-4">
    <v-list dense>
      <v-img :width="300" aspect-ratio="16/9" cover class="mx-auto" src="../assets/avatar.png"></v-img>
      <v-list-item class="text-center">
        <v-list-item-title class="sidebar-title ">{{ user?.name }}</v-list-item-title>
        <p class="sidebar-subtitle">{{ user?.bio }}</p>
        <v-container class="social-icons">
          <v-btn key="mdi-linkedin" v-if="user?.linkedin" :href="`https://linkedin.com/in/${user?.linkedin}`" icon
            class="mx-2" color="blue darken-1" target="_blank">
            <v-icon>mdi-linkedin</v-icon>
          </v-btn>
          <v-btn key="mdi-github" v-if="user?.github" :href="`https://github.com/${user?.github}`" icon class="mx-2"
            color="grey darken-4" target="_blank">
            <v-icon>mdi-github</v-icon>
          </v-btn>
          <v-btn key="mdi-twitter" v-if="user?.twitter" :href="`https://twitter.com/${user?.twitter}`" icon class="mx-2"
            color="blue lighten-2" target="_blank">
            <v-icon>mdi-twitter</v-icon>
          </v-btn>
          <v-btn key="mdi-mail" v-if="user?.email" :href="`mailto:${user?.email}`" icon class="mx-2"
            color="red lighten-2" target="_blank">
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
          <router-link :to="{ path: '/search/cero_day' }">
          <v-chip class="ma-1 tag">#cero_day</v-chip>
          </router-link>
          <router-link :to="{ path: '/search/seguridad' }">
          <v-chip class="ma-1 tag">#seguridad </v-chip>
          </router-link>
          <router-link :to="{ path: '/search/malware' }">
          <v-chip class="ma-1 tag">#malware </v-chip>
          </router-link>
          <router-link :to="{ path: '/search/analisis' }">
          <v-chip class="ma-1 tag">#analisis </v-chip>
          </router-link>
          <router-link :to="{ path: '/search/configuracion' }">
          <v-chip class="ma-1 tag">#configuracion </v-chip>
          </router-link>
          <router-link :to="{ path: '/search/humor' }">
          <v-chip class="ma-1 tag">#humor </v-chip>
          </router-link>
          <router-link :to="{ path: '/search/servidor ' }">
          <v-chip class="ma-1 tag">#servidor  </v-chip>
          </router-link>
          <router-link :to="{ path: '/search/entropía ' }">
          <v-chip class="ma-1 tag">#entropía  </v-chip>
          </router-link>
          <router-link :to="{ path: '/search/destrucción_ineficiente' }">
          <v-chip class="ma-1 tag">#destrucción_ineficiente </v-chip>
          </router-link>
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-divider class="my-2 separator" />

    <v-list-item class="recent-articles-view">
      <v-list-item-title class="sidebar-title">Artículos Recientes</v-list-item-title>

      <div v-for="articulo in database" :key="articulo.metadata?.title">
        <v-row no-gutters class="align-center">
          <!-- Columna izquierda: imagen -->
          <v-col cols="4">
            <v-img :src="articulo.metadata?.image" :alt="articulo.metadata?.title" cover />
          </v-col>

          <!-- Columna derecha: texto -->
          <v-col cols="8" class="pl-3">
            <router-link :to="articulo.slug" class="recent-articles">
              <div class="title">
                {{ articulo.metadata?.title }}
              </div>

              <div class="subtitle">
                {{ timeformat().format(new Date(articulo.metadata?.date)) }}
              </div>
            </router-link>
          </v-col>
        </v-row>

        <v-divider v-if="articulo !== database[database.length - 1]" class="my-2 separator" />
      </div>
    </v-list-item>














  </v-navigation-drawer>
</template>