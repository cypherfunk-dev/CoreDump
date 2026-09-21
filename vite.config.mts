// Plugins
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import Fonts from 'unplugin-fonts/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { coredumpContent } from './build/plugin'
import { loadContent } from './build/content'
import { siteConfig } from './src/site.config'

// Utilities
import { defineConfig } from 'vite'
import type { ViteSSGOptions } from 'vite-ssg'
import { fileURLToPath, URL } from 'node:url'
import { renameSync, rmSync, existsSync } from 'node:fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages en subruta (usuario.github.io/repo): BASE_PATH="/repo/"
  base: process.env.BASE_PATH || '/',
  plugins: [
    // content/**/*.md → virtual:content (+ sitemap.xml y rss.xml)
    coredumpContent(siteConfig),
    VueRouter({
      // El panel /admin solo existe en dev (depende de server/admin-server.js).
      exclude: mode === 'production' ? ['**/admin/**'] : [],
    }),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify(),
    Components(),
    // PWA: instalable y con los artículos ya visitados disponibles offline.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        name: siteConfig.title,
        short_name: siteConfig.name,
        description: siteConfig.description,
        lang: siteConfig.lang,
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // El sitio está prerenderizado: cada ruta tiene su HTML, no hay fallback SPA.
        navigateFallback: null,
        // Precache: HTML, JS, CSS y fuentes. Las imágenes se cachean al verlas
        // (precachearlas todas haría pesada la primera visita).
        globPatterns: ['**/*.{js,css,html,woff2,svg,ico}'],
        globIgnores: ['**/node_modules/**', '404.html'],
        runtimeCaching: [{
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: { cacheName: 'images', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
        }],
      },
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            // Vuetify usa Roboto por defecto; solo los pesos que se emplean.
            weights: [400, 500, 700],
            styles: ['normal'],
            subset: 'latin',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['vuetify'],
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 3000,
  },
  ssr: {
    // Vuetify importa .css desde sus componentes: hay que empaquetarlo en el
    // bundle SSR (Node no sabe importar CSS).
    noExternal: ['vuetify'],
  },
  // vite-ssg: prerenderiza las rutas estáticas + una página por entrada de contenido.
  ssgOptions: {
    script: 'async',
    formatting: 'none',
    // /tags/x → dist/tags/x/index.html: funciona con cualquier servidor estático
    dirStyle: 'nested',
    async includedRoutes(paths: string[]) {
      const { entries } = await loadContent({ root: process.cwd(), includeDrafts: false, markdown: siteConfig.markdown })
      const tags = new Set(entries.flatMap(e => e.meta.tags))
      const categories = new Set(entries.map(e => e.meta.category).filter(Boolean) as string[])
      // Sin encodeURIComponent: el nombre del archivo debe ser la ruta decodificada.
      return [
        '/404',
        ...paths.filter(p => !p.includes(':') && p !== '/articles'),
        ...entries.map(e => e.meta.url),
        ...[...tags].map(t => `/tags/${t}`),
        ...[...categories].map(c => `/categories/${c}`),
      ]
    },
    onFinished() {
      // /404 se prerenderiza como dist/404/index.html; Netlify, GitHub Pages y
      // nginx (error_page) esperan dist/404.html.
      const dir = fileURLToPath(new URL('dist/404', import.meta.url))
      if (existsSync(`${dir}/index.html`)) {
        renameSync(`${dir}/index.html`, `${dir}.html`)
        rmSync(dir, { recursive: true, force: true })
      }
    },
  } satisfies ViteSSGOptions,
}))
