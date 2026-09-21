<script setup lang="ts">
import { siteConfig } from '@/site.config';
import { useTexts } from '@/utils/i18n';
const texts = useTexts();
</script>

<template>
  <v-footer class="custom-footer">
    <v-col class="text-center">
      <div class="footer-divider"></div>
      <p class="footer-brand">{{ siteConfig.name }}</p>
      <p class="footer-links">
        <template v-for="link in siteConfig.nav" :key="link.to">
          <router-link :to="link.to">{{ link.label }}</router-link> ·
        </template>
        <template v-if="siteConfig.feed.enabled"><a href="/rss.xml">{{ texts.rss }}</a> · </template>
        <router-link to="/tags">{{ texts.allTags }}</router-link> · <router-link to="/categories">{{ texts.allCategories }}</router-link>
      </p>
      <p class="footer-copy">© {{ new Date().getFullYear() }} · {{ texts.allRightsReserved }}</p>
    </v-col>
  </v-footer>
</template>

<style scoped>
.custom-footer {
  background: rgb(var(--v-theme-surface)) !important;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding: 32px 24px 28px;
}

.footer-divider {
  width: 40px;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  margin: 0 auto 20px;
  border-radius: 1px;
}

.footer-brand {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.85);
  margin: 0 0 8px;
}

.footer-links {
  font-family: var(--font-body);
  font-size: 0.75rem;
  margin: 0 0 8px;
}
.footer-links a {
  color: rgba(var(--v-theme-on-surface), 0.55);
  text-decoration: none;
}
.footer-links a:hover {
  color: rgb(var(--v-theme-primary));
}

.footer-copy {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin: 0;
  letter-spacing: 0.02em;
}
</style>