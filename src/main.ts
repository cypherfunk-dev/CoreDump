/**
 * main.ts
 *
 * vite-ssg: en `npm run dev` funciona como SPA normal; en `npm run build`
 * prerenderiza cada ruta a HTML estático (SEO sin servidor).
 */
import { ViteSSG } from 'vite-ssg';
import { createPinia } from 'pinia';
import { routes } from 'vue-router/auto-routes';
import type { RouteRecordRaw } from 'vue-router';

import App from './App.vue';
import { registerPlugins } from '@/plugins';

// Styles
import 'unfonts.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/montserrat';
import 'katex/dist/katex.min.css';
import '@/styles/markdown-view.sass';

export const createApp = ViteSSG(
  App,
  {
    routes: routes as unknown as RouteRecordRaw[],
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition;
      if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' };
      return { top: 0 };
    },
  },
  ({ app, initialState, isClient }) => {
    const pinia = createPinia();
    app.use(pinia);
    registerPlugins(app);

    // Estado de Pinia serializado en el HTML prerenderizado y restaurado en cliente
    if (isClient) {
      pinia.state.value = initialState.pinia ?? {};
      import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
    } else {
      initialState.pinia = pinia.state.value;
    }
  },
  {
    rootContainer: '#app',
  },
);
