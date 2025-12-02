<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
</script>

<template>
  <v-app>
    <Navbar />
    <v-main>
      <router-view />
      <Sidebar />
    </v-main>
    <Footer />
  </v-app>
</template>
