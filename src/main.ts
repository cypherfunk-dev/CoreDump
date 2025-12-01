/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Styles
import "unfonts.css";
import "@/styles/markdown-view.sass";

// Stores
import { createPinia } from "pinia";

// Router
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { routes as generatedRoutes } from "vue-router/auto-routes";
const routes = generatedRoutes as unknown as RouteRecordRaw[];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
registerPlugins(app);

app.mount("#app");
