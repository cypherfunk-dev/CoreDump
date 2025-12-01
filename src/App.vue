<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import Article from './components/Article.vue';
</script>

<template>
  <v-app>
    <Navbar />
    <v-main class="layout">
      <Article />
      <Sidebar />
    </v-main>
  </v-app>
</template>
