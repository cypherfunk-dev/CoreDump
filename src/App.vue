<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
</script>

<template>
  <v-app>
    <Navbar />
    <v-main>
      <router-view />
      <Sidebar />
    </v-main>
  </v-app>
</template>
