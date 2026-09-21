<script setup lang="ts">
import { useUiStore, articles, popularTags } from '../stores/ui';
import usersdb from '../database/authors.json';
import siteTexts from '../database/site-texts.json';
import timeformat from '../utils/dateparser';
import avatar from '../assets/avatar.webp';
import { useDisplay } from 'vuetify';

const user = usersdb[0];
const ui = useUiStore();
const slogan = siteTexts.slogans[Math.floor(Math.random() * siteTexts.slogans.length)];
const recent = articles.slice(0, 5);
const tags = popularTags.slice(0, 12);

// En móvil el drawer es "temporary" y taparía el contenido: arranca cerrado.
const { mobile } = useDisplay();
if (mobile.value) ui.sidebar = false;

const socials = [
  { key: 'linkedin', icon: 'mdi-linkedin', color: 'blue-darken-1', href: (v: string) => `https://linkedin.com/in/${v}` },
  { key: 'github', icon: 'mdi-github', color: 'grey-darken-4', href: (v: string) => `https://github.com/${v}` },
  { key: 'twitter', icon: 'mdi-twitter', color: 'blue-lighten-2', href: (v: string) => `https://twitter.com/${v}` },
  { key: 'email', icon: 'mdi-mail', color: 'red-lighten-2', href: (v: string) => `mailto:${v}` },
] as const;
</script>

<template>
  <v-navigation-drawer app location="right" :width="470" v-model="ui.sidebar" class="bg-darken-4">
    <v-list dense>
      <v-img :width="300" aspect-ratio="16/9" cover class="mx-auto" :src="avatar" :alt="user?.name" />
      <v-list-item class="text-center">
        <v-list-item-title class="sidebar-title">{{ user?.name }}</v-list-item-title>
        <p class="sidebar-subtitle">{{ slogan }}</p>
        <v-container class="social-icons">
          <template v-for="s in socials" :key="s.key">
            <v-btn v-if="user?.[s.key]" :href="s.href(user[s.key])" icon class="mx-2" :color="s.color"
              target="_blank" rel="noopener">
              <v-icon>{{ s.icon }}</v-icon>
            </v-btn>
          </template>
        </v-container>
      </v-list-item>
    </v-list>
    <v-divider class="my-2 separator" />

    <v-card class="mx-14 my-8 tagscloud" outlined>
      <v-card-title class="sidebar-title">{{ siteTexts.tagscloud }}</v-card-title>
      <v-card-text>
        <v-chip-group column>
          <v-chip v-for="tag in tags" :key="tag" class="ma-1 tag" :to="`/search/${encodeURIComponent(tag)}`">
            #{{ tag }}
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-divider class="my-2 separator" />

    <v-list-item class="recent-articles-view">
      <v-list-item-title class="sidebar-title">{{ siteTexts.latestPosts }}</v-list-item-title>

      <template v-for="(articulo, i) in recent" :key="articulo.slug">
        <v-row no-gutters class="align-center">
          <v-col cols="4">
            <v-img :src="articulo.metadata.image" :alt="articulo.metadata.title" cover />
          </v-col>
          <v-col cols="8" class="pl-3">
            <router-link :to="articulo.slug" class="recent-articles">
              <div class="title">{{ articulo.metadata.title }}</div>
              <div class="subtitle">{{ timeformat().format(new Date(articulo.metadata.date)) }}</div>
            </router-link>
          </v-col>
        </v-row>
        <v-divider v-if="i < recent.length - 1" class="my-2 separator" />
      </template>
    </v-list-item>
  </v-navigation-drawer>
</template>