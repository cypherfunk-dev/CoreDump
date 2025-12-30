<script setup lang="ts">
import siteTexts from '../database/site-texts.json';
</script>

<template>
  <v-footer class="custom-footer">
    <v-col class="text-center">
      <div class="footer-divider"></div>
      <p class="footer-brand">{{ siteTexts.siteName }}</p>
      <p class="footer-copy">© {{ new Date().getFullYear() }} · Todos los derechos reservados</p>
    </v-col>
  </v-footer>
</template>

<style scoped>
.custom-footer {
  background: rgba(12, 12, 12, 0.95) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 32px 24px 28px;
}

.footer-divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #69F0AE, #00E676);
  margin: 0 auto 20px;
  border-radius: 1px;
}

.footer-brand {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 8px;
}

.footer-copy {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  letter-spacing: 0.02em;
}
</style>