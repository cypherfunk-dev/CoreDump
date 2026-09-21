<script setup lang="ts">
import { useUiStore, posts, popularTags } from '@/stores/ui';
import { siteConfig } from '@/site.config';
import { useTexts } from '@/utils/i18n';
import { formatDate } from '@/utils/dateparser';
import avatar from '@/assets/avatar.webp';
import { useDisplay } from 'vuetify';

const ui = useUiStore();
const texts = useTexts();
const { author } = siteConfig;
const slogan = siteConfig.slogans[Math.floor(Math.random() * siteConfig.slogans.length)];
const recent = posts.slice(0, siteConfig.home.recent);
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
  <v-navigation-drawer app location="right" :width="470" v-model="ui.sidebar">
    <v-list dense>
      <v-img :width="300" aspect-ratio="16/9" cover class="mx-auto" :src="avatar" :alt="author.name" />
      <v-list-item class="text-center">
        <v-list-item-title class="sidebar-title">{{ author.name }}</v-list-item-title>
        <p class="sidebar-subtitle">{{ slogan }}</p>
        <v-container class="social-icons">
          <template v-for="s in socials" :key="s.key">
            <v-btn v-if="author[s.key]" :href="s.href(author[s.key]!)" icon class="mx-2" :color="s.color"
              target="_blank" rel="noopener" :aria-label="s.key">
              <v-icon>{{ s.icon }}</v-icon>
            </v-btn>
          </template>
        </v-container>
      </v-list-item>
    </v-list>
    <v-divider class="my-2 separator" />

    <v-card v-if="tags.length" class="mx-14 my-8 tagscloud" outlined>
      <v-card-title class="sidebar-title">{{ texts.tagscloud }}</v-card-title>
      <v-card-text>
        <v-chip-group column>
          <v-chip v-for="tag in tags" :key="tag" class="ma-1 tag" :to="`/tags/${encodeURIComponent(tag)}`">
            #{{ tag }}
          </v-chip>
        </v-chip-group>
        <router-link to="/tags" class="tags-more">{{ texts.allTags }} →</router-link>
      </v-card-text>
    </v-card>
    <v-divider class="my-2 separator" />

    <v-list-item class="recent-articles-view">
      <v-list-item-title class="sidebar-title">{{ texts.latestPosts }}</v-list-item-title>

      <template v-for="(articulo, i) in recent" :key="articulo.url">
        <v-row no-gutters class="align-center">
          <v-col cols="4">
            <v-img v-if="articulo.image" :src="articulo.image" :srcset="articulo.imageSrcset" sizes="160px"
              :alt="articulo.title" cover />
          </v-col>
          <v-col cols="8" class="pl-3">
            <router-link :to="articulo.url" class="recent-articles">
              <div class="title">{{ articulo.title }}</div>
              <div class="subtitle">{{ formatDate(articulo.date) }}</div>
            </router-link>
          </v-col>
        </v-row>
        <v-divider v-if="i < recent.length - 1" class="my-2 separator" />
      </template>
    </v-list-item>
  </v-navigation-drawer>
</template>

<style scoped>
.tags-more {
  display: block;
  margin-top: 8px;
  font-size: 0.8rem;
  text-align: right;
  color: inherit;
  opacity: 0.7;
  text-decoration: none;
}
.tags-more:hover {
  opacity: 1;
}
</style>
