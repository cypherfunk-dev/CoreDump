<script setup>
import base from '@/database/db.json'
import timeformat from '@/utils/dateparser.ts'
import siteTexts from '@/database/site-texts.json'
const random = Math.floor(Math.random()*siteTexts.slogans.length);

</script>

<template>
  <div class="blog-index">
    <!-- Masthead / Header -->
    <header class="blog-masthead">
      <p class="masthead-tagline">{{ siteTexts.slogans[random] }}</p>
      <div class="masthead-divider"></div>
    </header>

    <!-- Bento Grid Layout -->
    <section class="bento-grid">
      <!-- Hero Card (Large) -->
      <router-link :to="base[0].slug" class="bento-card bento-hero">
        <div class="bento-image-wrapper">
          <v-img :src="base[0].metadata.image" :alt="base[0].metadata.title" class="bento-image" cover />
        </div>
        <div class="bento-overlay bento-overlay-dark">
          <div class="bento-tags">
            <span class="bento-category">{{ base[0].metadata.category }}</span>
          </div>
          <h2 class="bento-title bento-title-lg">{{ base[0].metadata.title }}</h2>
          <p class="bento-abstract">{{ base[0].metadata.abstract }}</p>
          <div class="bento-meta">
            <span class="bento-author">{{ base[0].metadata.author }}</span>
            <span class="meta-dot">•</span>
            <span class="bento-date">{{ timeformat().format(new Date(base[0].metadata.date)) }}</span>
          </div>
        </div>
      </router-link>

      <!-- Medium Card (Top Right) -->
      <router-link :to="base[1].slug" class="bento-card bento-medium-1">
        <div class="bento-image-wrapper">
          <v-img :src="base[1].metadata.image" :alt="base[1].metadata.title" class="bento-image" cover />
        </div>
        <div class="bento-overlay">
          <div class="bento-tags">
            <span class="bento-category">{{ base[1].metadata.category }}</span>
          </div>
          <h3 class="bento-title bento-title-md">{{ base[1].metadata.title }}</h3>
          <div class="bento-meta">
            <span class="bento-author">{{ base[1].metadata.author }}</span>
            <span class="meta-dot">•</span>
            <span class="bento-date">{{ timeformat().format(new Date(base[1].metadata.date)) }}</span>
          </div>
        </div>
      </router-link>

      <router-link :to="base[2].slug" class="bento-card bento-small-1">
        <div class="bento-image-wrapper">
          <v-img :src="base[2].metadata.image" :alt="base[2].metadata.title" class="bento-image" cover />
        </div>
        <div class="bento-overlay bento-overlay-accent">
          <span class="bento-category">{{ base[2].metadata.category }}</span>
          <h3 class="bento-title bento-title-sm">{{ base[2].metadata.title }}</h3>
        </div>
        <div class="bento-meta">
            <span class="bento-author">{{ base[2].metadata.author }}</span>
            <span class="meta-dot">•</span>
            <span class="bento-date">{{ timeformat().format(new Date(base[2].metadata.date)) }}</span>
          </div>
      </router-link>

      <!-- Wide Card -->
      <router-link :to="base[3].slug" class="bento-card bento-wide">
        <div class="bento-image-wrapper">
          <v-img :src="base[3].metadata.image" :alt="base[3].metadata.title" class="bento-image" cover />
        </div>
        <div class="bento-overlay bento-overlay-gradient">
          <div class="bento-tags">
            <span class="bento-category">{{ base[3].metadata.category }}</span>
          </div>
          <h3 class="bento-title bento-title-md">{{ base[3].metadata.title }}</h3>
          <p class="bento-abstract bento-abstract-sm">{{ base[3].metadata.abstract }}</p>
          <div class="bento-meta">
            <span class="bento-author">{{ base[3].metadata.author }}</span>
            <span class="meta-dot">•</span>
            <span class="bento-date">{{ timeformat().format(new Date(base[3].metadata.date)) }}</span>
          </div>
        </div>
      </router-link>

      <!-- Medium Card 2 -->
      <router-link :to="base[4].slug" class="bento-card bento-medium-2">
        <div class="bento-image-wrapper">
          <v-img :src="base[4].metadata.image" :alt="base[4].metadata.title" class="bento-image" cover />
        </div>
        <div class="bento-overlay">
          <div class="bento-tags">
            <span class="bento-category">{{ base[4].metadata.category }}</span>
          </div>
          <h3 class="bento-title bento-title-md">{{ base[4].metadata.title }}</h3>
          <p class="bento-abstract bento-abstract-sm">{{ base[4].metadata.abstract }}</p>
          <div class="bento-meta">
            <span class="bento-author">{{ base[4].metadata.author }}</span>
            <span class="meta-dot">•</span>
            <span class="bento-date">{{ timeformat().format(new Date(base[4].metadata.date)) }}</span>
          </div>
        </div>
      </router-link>

      <!-- Small Card 2 -->
      <router-link :to="base[5].slug" class="bento-card bento-small-2">
        <div class="bento-image-wrapper">
          <v-img :src="base[5].metadata.image" :alt="base[5].metadata.title" class="bento-image" cover />
        </div>
        <div class="bento-overlay bento-overlay-accent-alt">
          <span class="bento-category">{{ base[5].metadata.category }}</span>
          <h3 class="bento-title bento-title-sm">{{ base[5].metadata.title }}</h3>
          <p class="bento-abstract bento-abstract-sm">{{ base[5].metadata.abstract }}</p>

          <div class="bento-meta">
            <span class="bento-author">{{ base[5].metadata.author }}</span>
            <span class="meta-dot">•</span>
            <span class="bento-date">{{ timeformat().format(new Date(base[5].metadata.date)) }}</span>
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
  background-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%),url('@/assets/banner.png');
  background-size: cover;
}

.masthead-title {
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 12px;
  line-height: 1.1;
}

.masthead-tagline {
  font-family: 'Inter', sans-serif;
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
.bento-hero { grid-column: span 7; grid-row: span 2; }
.bento-medium-1 { grid-column: span 5; grid-row: span 1; }
.bento-small-1 { grid-column: span 5; grid-row: span 1; }
.bento-wide { grid-column: span 8; grid-row: span 1; }
.bento-medium-2 { grid-column: span 4; grid-row: span 1; }
.bento-small-2 { grid-column: span 12; grid-row: span 1; }

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
  background: rgba(30, 30, 30, 0.6);
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
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.5) 40%,
    rgba(0, 0, 0, 0.1) 70%,
    transparent 100%
  );
}

.bento-overlay-dark {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.92) 0%,
    rgba(0, 0, 0, 0.6) 35%,
    rgba(0, 0, 0, 0.2) 60%,
    transparent 100%
  );
}

.bento-overlay-gradient {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

.bento-overlay-accent {
  background: linear-gradient(
    to top,
    rgba(16, 185, 129, 0.9) 0%,
    rgba(16, 185, 129, 0.6) 40%,
    rgba(16, 185, 129, 0.2) 70%,
    transparent 100%
  );
}

.bento-overlay-accent-alt {
  background: linear-gradient(
    to top,
    rgba(99, 102, 241, 0.88) 0%,
    rgba(99, 102, 241, 0.55) 45%,
    rgba(99, 102, 241, 0.15) 75%,
    transparent 100%
  );
}

/* ─────────────────────────────────────────────────────────────
   TYPOGRAPHY - Títulos y textos
   ───────────────────────────────────────────────────────────── */
.bento-tags {
  margin-bottom: 10px;
}

.bento-category {
  display: inline-block;
  font-family: 'Inter', sans-serif;
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
  font-family: 'Montserrat', sans-serif;
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

.bento-abstract {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.55;
  margin: 0 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bento-abstract-sm {
  font-size: 0.8rem;
  -webkit-line-clamp: 2;
}

/* ─────────────────────────────────────────────────────────────
   META - Autor y fecha
   ───────────────────────────────────────────────────────────── */
.bento-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
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

  .bento-hero { grid-column: span 6; grid-row: span 1; min-height: 300px; }
  .bento-medium-1 { grid-column: span 3; min-height: 220px; }
  .bento-small-1 { grid-column: span 3; min-height: 220px; }
  .bento-wide { grid-column: span 6; min-height: 200px; }
  .bento-medium-2 { grid-column: span 3; min-height: 200px; }
  .bento-small-2 { grid-column: span 3; min-height: 200px; }

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

  .masthead-title {
    font-size: 1.5rem;
    letter-spacing: 0.05em;
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

  .bento-abstract {
    font-size: 0.82rem;
    -webkit-line-clamp: 2;
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

  .masthead-title {
    font-size: 1.3rem;
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

.bento-hero { animation-delay: 0.05s; }
.bento-medium-1 { animation-delay: 0.12s; }
.bento-small-1 { animation-delay: 0.18s; }
.bento-wide { animation-delay: 0.24s; }
.bento-medium-2 { animation-delay: 0.30s; }
.bento-small-2 { animation-delay: 0.36s; }

.blog-masthead {
  animation: fadeSlideUp 0.5s ease-out;
}
</style>
