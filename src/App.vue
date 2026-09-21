<script setup lang="ts">
import { useHead } from '@unhead/vue';
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ModalSearch from './components/ModalSearch.vue';
import { siteConfig } from '@/site.config';

const analytics = siteConfig.analytics;
const analyticsScript =
  analytics.provider === 'plausible'
    ? [{ src: analytics.src ?? 'https://plausible.io/js/script.js', defer: true, 'data-domain': analytics.domain }]
    : analytics.provider === 'umami'
      ? [{ src: analytics.src ?? 'https://cloud.umami.is/script.js', defer: true, 'data-website-id': analytics.websiteId }]
      : [];

useHead({
  htmlAttrs: { lang: siteConfig.lang },
  script: analyticsScript,
  titleTemplate: (title?: string) => (title ? `${title} | ${siteConfig.name}` : siteConfig.title),
  meta: [
    { name: 'description', content: siteConfig.description },
    { property: 'og:site_name', content: siteConfig.name },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: siteConfig.title },
    { property: 'og:description', content: siteConfig.description },
    { property: 'og:url', content: siteConfig.url },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: siteConfig.url },
    ...(siteConfig.feed.enabled
      ? [{ rel: 'alternate', type: 'application/rss+xml', title: siteConfig.title, href: `${siteConfig.url}/rss.xml` }]
      : []),
  ],
});
</script>

<template>
  <v-app>
    <Navbar />
    <ModalSearch />
    <v-main>
      <!-- Suspense: las páginas de contenido hacen `await` en setup (SSG) -->
      <router-view v-slot="{ Component }">
        <Suspense>
          <component :is="Component" />
        </Suspense>
      </router-view>
    </v-main>
    <Sidebar />
    <Footer />
  </v-app>
</template>
