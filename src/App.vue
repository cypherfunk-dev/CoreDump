<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ModalSearch from './components/ModalSearch.vue';
</script>

<template>
  <v-app>
    <Navbar />
    <ModalSearch />
    <v-main>
      <router-view />
    </v-main>
    <Sidebar />
    <Footer />
  </v-app>
</template>

