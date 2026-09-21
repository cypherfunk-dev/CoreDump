<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { posts } from '@/stores/ui';
import { formatDate } from '@/utils/dateparser';
import { siteConfig } from '@/site.config';

useHead({ title: null });

const slogan = siteConfig.slogans[Math.floor(Math.random() * siteConfig.slogans.length)];

// Posición de cada tarjeta en el bento grid; el primero (más reciente) es el hero.
const layouts = ['bento-hero', 'bento-medium-1', 'bento-small-1', 'bento-wide', 'bento-medium-2', 'bento-small-2'];
const titleSizes = ['bento-title-lg', 'bento-title-md', 'bento-title-sm', 'bento-title-md', 'bento-title-md', 'bento-title-sm'];
const overlays = ['bento-overlay-dark', '', '', 'bento-overlay-gradient', '', ''];

const featured = posts.slice(0, Math.min(siteConfig.home.featured, layouts.length)).map((article, i) => ({
  ...article,
  layout: layouts[i],
  titleSize: titleSizes[i],
  overlay: overlays[i],
  dateLabel: formatDate(article.date),
}));
</script>

<template>
  <div class="blog-index">
    <!-- Masthead / Header -->
    <header class="blog-masthead">
      <p class="masthead-tagline">{{ slogan }}</p>
      <div class="masthead-divider"></div>
    </header>

    <!-- Bento Grid Layout -->
    <section class="bento-grid">
      <router-link v-for="(article, i) in featured" :key="article.url" :to="article.url"
        class="bento-card" :class="article.layout">
        <div class="bento-image-wrapper">
          <v-img :src="article.image" :srcset="article.imageSrcset" :alt="article.title" class="bento-image" cover
            :sizes="i === 0 ? '(max-width: 1024px) 100vw, 60vw' : '(max-width: 640px) 100vw, 40vw'"
            :eager="i === 0" />
        </div>
        <div class="bento-overlay" :class="article.overlay">
          <div class="bento-tags">
            <span v-if="article.category" class="bento-category">{{ article.category }}</span>
          </div>
          <component :is="i === 0 ? 'h2' : 'h3'" class="bento-title" :class="article.titleSize">
            {{ article.title }}
          </component>
          <div class="bento-meta">
            <span class="bento-author">{{ article.author }}</span>
            <span class="meta-dot">•</span>
            <span class="bento-date">{{ article.dateLabel }}</span>
          </div>
        </div>
      </router-link>
    </section>
  </div>
</template>

<style scoped>
.blog-index {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.blog-masthead {
  text-align: center;
  padding: 48px 16px 32px;
  margin-bottom: 8px;
background-image: linear-gradient(
    to bottom, 
    rgba(0, 0, 0, 0.7) 0%, /* 50% de oscuridad arriba */
    rgba(0, 0, 0, 1) 100% /* 80% de oscuridad abajo */
  ), 
  url('@/assets/banner.webp');  
  background-size: cover;
  
}

.masthead-tagline {
  font-family: var(--font-body);
  font-size: clamp(0.875rem, 2vw, 1.05rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  letter-spacing: 0.02em;
}

.masthead-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #69F0AE, #00E676);
  margin: 24px auto 0;
  border-radius: 2px;
}

/* ─────────────────────────────────────────────────────────────
   BENTO GRID - CSS Grid Layout
   ───────────────────────────────────────────────────────────── */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(3, minmax(180px, auto));
  gap: 16px;
  grid-auto-flow: dense;
}

/* Grid Areas */
.bento-hero {
  grid-column: span 7;
  grid-row: span 2;
}

.bento-medium-1 {
  grid-column: span 5;
  grid-row: span 1;
}

.bento-small-1 {
  grid-column: span 5;
  grid-row: span 1;
}

.bento-wide {
  grid-column: span 8;
  grid-row: span 1;
}

.bento-medium-2 {
  grid-column: span 4;
  grid-row: span 1;
}

.bento-small-2 {
  grid-column: span 12;
  grid-row: span 1;
}

/* ─────────────────────────────────────────────────────────────
   BENTO CARDS - Base Styles
   ───────────────────────────────────────────────────────────── */
.bento-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: block;
  background: rgb(var(--v-theme-surface));
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    box-shadow 0.35s ease;
}

.bento-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(105, 240, 174, 0.15);
}

.bento-card:active {
  transform: translateY(-2px) scale(1.005);
}

/* Image wrapper */
.bento-image-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bento-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    filter 0.4s ease;
}

.bento-card:hover .bento-image {
  transform: scale(1.08);
  filter: brightness(0.85);
}

/* ─────────────────────────────────────────────────────────────
   OVERLAYS - Gradientes y fondos
   ───────────────────────────────────────────────────────────── */
.bento-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.5) 40%,
      rgba(0, 0, 0, 0.1) 70%,
      transparent 100%);
}

.bento-overlay-dark {
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.92) 0%,
      rgba(0, 0, 0, 0.6) 35%,
      rgba(0, 0, 0, 0.2) 60%,
      transparent 100%);
}

.bento-overlay-gradient {
  background: linear-gradient(135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.5) 50%,
      rgba(0, 0, 0, 0.8) 100%);
}


/* ─────────────────────────────────────────────────────────────
   TYPOGRAPHY - Títulos y textos
   ───────────────────────────────────────────────────────────── */
.bento-tags {
  margin-bottom: 10px;
}

.bento-category {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #69F0AE;
  background: rgba(0, 0, 0, 0.45);
  padding: 5px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.bento-title {
  font-family: var(--font-heading);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.98);
  margin: 0 0 10px;
  line-height: 1.25;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.bento-title-lg {
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.bento-title-md {
  font-size: clamp(1.05rem, 2vw, 1.35rem);
}

.bento-title-sm {
  font-size: clamp(0.95rem, 1.8vw, 1.15rem);
}



/* ─────────────────────────────────────────────────────────────
   META - Autor y fecha
   ───────────────────────────────────────────────────────────── */
.bento-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;
}

.bento-author {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.meta-dot {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.5rem;
}

.bento-date {
  font-weight: 400;
}

/* ─────────────────────────────────────────────────────────────
   RESPONSIVE - Tablets y móviles
   ───────────────────────────────────────────────────────────── */

/* Tablets */
@media (max-width: 1024px) {
  .blog-index {
    padding: 0 20px 40px;
  }

  .bento-grid {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: auto;
    gap: 14px;
  }

  .bento-hero {
    grid-column: span 6;
    grid-row: span 1;
    min-height: 300px;
  }

  .bento-medium-1 {
    grid-column: span 3;
    min-height: 220px;
  }

  .bento-small-1 {
    grid-column: span 3;
    min-height: 220px;
  }

  .bento-wide {
    grid-column: span 6;
    min-height: 200px;
  }

  .bento-medium-2 {
    grid-column: span 3;
    min-height: 200px;
  }

  .bento-small-2 {
    grid-column: span 3;
    min-height: 200px;
  }

  .bento-overlay {
    padding: 20px;
  }
}

/* Móviles */
@media (max-width: 640px) {
  .blog-index {
    padding: 0 16px 32px;
  }

  .blog-masthead {
    padding: 32px 12px 24px;
  }

  .masthead-tagline {
    font-size: 0.85rem;
  }

  .masthead-divider {
    width: 48px;
    height: 2px;
    margin-top: 18px;
  }

  .bento-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .bento-hero,
  .bento-medium-1,
  .bento-small-1,
  .bento-wide,
  .bento-medium-2,
  .bento-small-2 {
    grid-column: span 1;
    grid-row: span 1;
    min-height: 200px;
  }

  .bento-hero {
    min-height: 280px;
  }

  .bento-overlay {
    padding: 18px;
  }

  .bento-title-lg {
    font-size: 1.35rem;
  }

  .bento-title-md {
    font-size: 1.1rem;
  }

  .bento-title-sm {
    font-size: 1rem;
  }

  .bento-category {
    font-size: 0.65rem;
    padding: 4px 10px;
  }


  .bento-meta {
    font-size: 0.7rem;
  }

  .bento-card:hover {
    transform: translateY(-2px);
  }
}

/* Móviles pequeños */
@media (max-width: 380px) {
  .blog-index {
    padding: 0 12px 24px;
  }

  .bento-hero {
    min-height: 240px;
  }

  .bento-medium-1,
  .bento-small-1,
  .bento-wide,
  .bento-medium-2,
  .bento-small-2 {
    min-height: 180px;
  }
}

/* ─────────────────────────────────────────────────────────────
   ANIMACIONES DE ENTRADA
   ───────────────────────────────────────────────────────────── */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bento-card {
  animation: fadeSlideUp 0.6s ease-out backwards;
}

.bento-hero {
  animation-delay: 0.05s;
}

.bento-medium-1 {
  animation-delay: 0.12s;
}

.bento-small-1 {
  animation-delay: 0.18s;
}

.bento-wide {
  animation-delay: 0.24s;
}

.bento-medium-2 {
  animation-delay: 0.30s;
}

.bento-small-2 {
  animation-delay: 0.36s;
}

.blog-masthead {
  animation: fadeSlideUp 0.5s ease-out;
}
</style>
