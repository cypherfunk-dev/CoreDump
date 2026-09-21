<script lang="ts" setup>
import { useUiStore, availableCategories, type AdvancedSearchOptions, type SearchField } from '@/stores/ui';
import { useRoute, useRouter } from 'vue-router';
import { computed, watch, onMounted, ref } from 'vue';
import { useTexts } from '@/utils/i18n';
import { useHead } from '@unhead/vue';
import { formatDate } from '@/utils/dateparser';

const ui = useUiStore();
const texts = useTexts();
ui.ensureSearchIndex();
const route = useRoute();
const router = useRouter();

// Show/hide advanced options panel
const showAdvanced = ref(false);

// Reactive query from URL
const query = computed(() => decodeURIComponent(route.params.query as string || ''));

// Search results computed from query using advanced search
const results = computed(() => {
  if (!query.value || !ui.searchReady) return [];
  return ui.advancedSearch(query.value);
});

// Suggestions for autocomplete
const suggestions = computed(() => {
  return ui.getSuggestions(ui.search);
});

// Sync search input with URL query
watch(query, (newQuery) => {
  ui.search = newQuery;
}, { immediate: true });

// Handle new search from input
function handleSearch() {
  if (ui.search && ui.search !== query.value) {
    router.push(`/search/${encodeURIComponent(ui.search)}`);
  }
}

// Toggle field in search fields array
function toggleSearchField(field: SearchField) {
  const fields = [...ui.advancedOptions.searchFields];
  const idx = fields.indexOf(field);
  if (idx > -1) {
    if (fields.length > 1) fields.splice(idx, 1); // Keep at least one field
  } else {
    fields.push(field);
  }
  ui.updateSearchOption('searchFields', fields);
}

// Check if field is active
function isFieldActive(field: string) {
  return ui.advancedOptions.searchFields.includes(field as any);
}

// Reset to defaults
function resetOptions() {
  ui.resetSearchOptions();
}

// Field labels
const fieldLabels: Record<string, string> = {
  title: 'Título',
  tags: 'Tags',
  abstract: 'Resumen',
  category: 'Categoría',
  author: 'Autor',
  body: 'Contenido'
};

// Fuzzy level labels
const fuzzyLevels = [
  { value: 'exact', label: 'Exacta', icon: 'mdi-target', desc: 'Solo coincidencias exactas' },
  { value: 'normal', label: 'Normal', icon: 'mdi-magnify', desc: 'Tolerancia moderada a errores' },
  { value: 'aggressive', label: 'Amplia', icon: 'mdi-blur', desc: 'Mayor tolerancia a errores tipográficos' }
];

// Sort options
const sortOptions = [
  { value: 'relevance', label: 'Relevancia', icon: 'mdi-star' },
  { value: 'date-desc', label: 'Más recientes', icon: 'mdi-sort-calendar-descending' },
  { value: 'date-asc', label: 'Más antiguos', icon: 'mdi-sort-calendar-ascending' },
  { value: 'title', label: 'Alfabético', icon: 'mdi-sort-alphabetical-ascending' }
];

onMounted(() => {
  ui.search = query.value;
});

useHead({ title: computed(() => `${texts.advancedSearch}: ${query.value}`), meta: [{ name: 'robots', content: 'noindex' }] });
</script>

<template>
  <div class="search-page">
    <!-- Search Header -->
    <div class="search-header">
      <h1 class="search-page-title">{{ texts.advancedSearch }}</h1>
      <div class="search-input-wrapper">
        <v-text-field
          v-model="ui.search"
          :placeholder="texts.searchPlaceholder"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          prepend-inner-icon="mdi-magnify"
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <v-btn color="primary" class="search-btn" @click="handleSearch">
          <v-icon left>mdi-magnify</v-icon>
          Buscar
        </v-btn>
      </div>
      
      <!-- Suggestions -->
      <div class="suggestions-row" v-if="suggestions.length && ui.search.length >= 2 && ui.search !== query">
        <span class="suggestions-label">Sugerencias:</span>
        <v-chip
          v-for="sug in suggestions"
          :key="sug.suggestion"
          size="small"
          variant="outlined"
          class="suggestion-chip"
          @click="ui.search = sug.suggestion; handleSearch()"
        >
          {{ sug.suggestion }}
        </v-chip>
      </div>

      <!-- Toggle Advanced Options -->
      <v-btn
        variant="text"
        size="small"
        class="toggle-advanced-btn"
        @click="showAdvanced = !showAdvanced"
      >
        <v-icon left>{{ showAdvanced ? 'mdi-chevron-up' : 'mdi-tune-variant' }}</v-icon>
        {{ showAdvanced ? 'Ocultar opciones' : 'Opciones avanzadas' }}
      </v-btn>
    </div>

    <!-- Advanced Options Panel -->
    <v-expand-transition>
      <div v-if="showAdvanced" class="advanced-panel">
        <div class="advanced-panel-content">
          
          <!-- Fuzzy Level -->
          <div class="option-group">
            <label class="option-label">Tipo de búsqueda</label>
            <div class="fuzzy-options">
              <v-btn
                v-for="level in fuzzyLevels"
                :key="level.value"
                :variant="ui.advancedOptions.fuzzyLevel === level.value ? 'flat' : 'outlined'"
                :color="ui.advancedOptions.fuzzyLevel === level.value ? 'primary' : undefined"
                size="small"
                class="fuzzy-btn"
                @click="ui.updateSearchOption('fuzzyLevel', level.value as AdvancedSearchOptions['fuzzyLevel'])"
              >
                <v-icon left size="small">{{ level.icon }}</v-icon>
                {{ level.label }}
                <v-tooltip activator="parent" location="bottom">{{ level.desc }}</v-tooltip>
              </v-btn>
            </div>
          </div>

          <!-- Search Fields -->
          <div class="option-group">
            <label class="option-label">Buscar en</label>
            <div class="fields-chips">
              <v-chip
                v-for="(label, field) in fieldLabels"
                :key="field"
                :variant="isFieldActive(field) ? 'flat' : 'outlined'"
                :color="isFieldActive(field) ? 'primary' : undefined"
                size="small"
                class="field-chip"
                @click="toggleSearchField(field as any)"
              >
                <v-icon left size="x-small" v-if="isFieldActive(field)">mdi-check</v-icon>
                {{ label }}
              </v-chip>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="option-group">
            <label class="option-label">Filtrar por categoría</label>
            <v-select
              v-model="ui.advancedOptions.categoryFilter"
              :items="[{ title: 'Todas las categorías', value: null }, ...availableCategories.map(c => ({ title: c, value: c }))]"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              class="category-select"
            />
          </div>

          <!-- Sort By -->
          <div class="option-group">
            <label class="option-label">Ordenar por</label>
            <div class="sort-options">
              <v-btn
                v-for="opt in sortOptions"
                :key="opt.value"
                :variant="ui.advancedOptions.sortBy === opt.value ? 'flat' : 'outlined'"
                :color="ui.advancedOptions.sortBy === opt.value ? 'primary' : undefined"
                size="small"
                class="sort-btn"
                @click="ui.updateSearchOption('sortBy', opt.value as AdvancedSearchOptions['sortBy'])"
              >
                <v-icon left size="small">{{ opt.icon }}</v-icon>
                {{ opt.label }}
              </v-btn>
            </div>
          </div>

          <!-- Additional Options Row -->
          <div class="option-group options-row">
            <v-checkbox
              v-model="ui.advancedOptions.prefixSearch"
              label="Búsqueda por prefijo"
              density="compact"
              hide-details
              class="option-checkbox"
            />
            <v-btn-toggle
              v-model="ui.advancedOptions.combineWith"
              mandatory
              density="compact"
              class="combine-toggle"
            >
              <v-btn value="OR" size="small">
                Cualquier palabra
                <v-tooltip activator="parent" location="bottom">Coincide con cualquiera de los términos (OR)</v-tooltip>
              </v-btn>
              <v-btn value="AND" size="small">
                Todas las palabras
                <v-tooltip activator="parent" location="bottom">Debe coincidir con todos los términos (AND)</v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </div>

          <!-- Reset Button -->
          <div class="reset-row">
            <v-btn variant="text" size="small" @click="resetOptions">
              <v-icon left>mdi-refresh</v-icon>
              Restablecer opciones
            </v-btn>
          </div>
        </div>
      </div>
    </v-expand-transition>

    <!-- Results Summary -->
    <div class="results-summary" v-if="query">
      <span v-if="results.length">
        {{ results.length }} {{ results.length === 1 ? 'resultado' : 'resultados' }} para "<strong>{{ query }}</strong>"
        <span v-if="ui.advancedOptions.categoryFilter" class="filter-badge">
          en {{ ui.advancedOptions.categoryFilter }}
        </span>
      </span>
      <span v-else-if="!ui.searchReady" class="no-results">{{ texts.searchLoading }}</span>
      <span v-else class="no-results">
        {{ texts.noResultsFound }} para "<strong>{{ query }}</strong>"
      </span>
    </div>

    <!-- Results Grid -->
    <div class="search-results-grid" v-if="results.length">
      <router-link
        v-for="result in results"
        :key="result.id"
        :to="result.url"
        class="search-result-card-link"
      >
        <article class="search-result-card">
          <div class="result-content">
            <span class="result-category">{{ result.category || 'General' }}</span>
            <h3 class="result-title">{{ result.title }}</h3>
            <p class="result-abstract">{{ result.abstract }}</p>
            <div class="result-meta">
              <span class="result-author" v-if="result.author">
                <v-icon size="x-small">mdi-account</v-icon>
                {{ result.author }}
              </span>
              <span class="result-date">
                <v-icon size="x-small">mdi-calendar</v-icon>
                {{ formatDate(result.date) }}
              </span>
              <span class="result-score" v-if="result.score && ui.advancedOptions.sortBy === 'relevance'">
                <v-icon size="x-small">mdi-star</v-icon>
                {{ Math.round(result.score * 10) / 10 }}
              </span>
            </div>
          </div>
        </article>
      </router-link>
    </div>

    <!-- Empty State -->
    <div class="search-empty-state" v-else-if="query && !results.length">
      <v-icon size="64" color="grey">mdi-magnify-close</v-icon>
      <p>Intenta con otros términos de búsqueda</p>
      <p class="empty-hint" v-if="ui.advancedOptions.fuzzyLevel === 'exact'">
        Tip: Prueba cambiar a búsqueda "Normal" o "Amplia" para más resultados
      </p>
      <router-link to="/" class="back-home-link">
        <v-btn variant="outlined">{{ texts.goBackHome }}</v-btn>
      </router-link>
    </div>
  </div>
</template>

<style lang="sass" scoped>
$search-bg: rgb(var(--v-theme-background))
$search-surface: rgb(var(--v-theme-surface))
$search-accent: rgb(var(--v-theme-primary))
$search-text: rgb(var(--v-theme-on-surface))
$search-text-muted: rgba(var(--v-theme-on-surface), 0.6)

.search-page
  background: $search-bg
  min-height: 100vh
  padding: 40px 24px 60px

.search-header
  max-width: 800px
  margin: 0 auto 32px
  text-align: center

.search-page-title
  font-family: var(--font-heading)
  font-size: 2rem
  font-weight: 700
  color: $search-text
  margin-bottom: 24px

.search-input-wrapper
  display: flex
  gap: 12px
  max-width: 600px
  margin: 0 auto

.search-input
  flex: 1

.search-btn
  height: 56px
  padding: 0 24px

// Suggestions
.suggestions-row
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  margin-top: 12px
  flex-wrap: wrap

.suggestions-label
  font-size: 0.85rem
  color: $search-text-muted

.suggestion-chip
  cursor: pointer
  &:hover
    border-color: $search-accent

// Toggle Advanced Button
.toggle-advanced-btn
  margin-top: 16px
  color: $search-text-muted
  &:hover
    color: $search-accent

// Advanced Panel
.advanced-panel
  max-width: 900px
  margin: 0 auto 32px
  background: $search-surface
  border-radius: 12px
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08)

.advanced-panel-content
  padding: 24px
  display: flex
  flex-direction: column
  gap: 20px

.option-group
  display: flex
  flex-direction: column
  gap: 8px

.option-label
  font-family: var(--font-body)
  font-size: 0.85rem
  font-weight: 600
  color: $search-text
  letter-spacing: 0.5px

.fuzzy-options, .sort-options
  display: flex
  gap: 8px
  flex-wrap: wrap

.fuzzy-btn, .sort-btn
  text-transform: none
  font-weight: 500

.fields-chips
  display: flex
  gap: 8px
  flex-wrap: wrap

.field-chip
  cursor: pointer

.category-select
  max-width: 300px

.options-row
  flex-direction: row
  align-items: center
  gap: 24px
  flex-wrap: wrap

.option-checkbox
  flex-shrink: 0

.combine-toggle
  border-radius: 8px

.reset-row
  display: flex
  justify-content: flex-end
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08)
  padding-top: 16px
  margin-top: 8px

.filter-badge
  background: rgba(var(--v-theme-primary), 0.2)
  color: $search-accent
  padding: 2px 8px
  border-radius: 4px
  font-size: 0.85rem
  margin-left: 8px

.results-summary
  max-width: 800px
  margin: 0 auto 24px
  font-family: var(--font-body)
  font-size: 1rem
  color: $search-text-muted
  text-align: center
  strong
    color: $search-accent

.no-results
  color: #e57373

.search-results-grid
  max-width: 900px
  margin: 0 auto
  display: flex
  flex-direction: column
  gap: 16px

.search-result-card-link
  text-decoration: none
  color: inherit

.search-result-card
  background: $search-surface
  border-radius: 10px
  padding: 24px
  transition: transform 0.2s ease, box-shadow 0.2s ease
  border-left: 4px solid $search-accent
  &:hover
    transform: translateX(4px)
    box-shadow: 0 8px 24px rgba(0,0,0,0.3)

.result-content
  display: flex
  flex-direction: column
  gap: 8px

.result-category
  font-family: var(--font-body)
  font-size: 0.7rem
  font-weight: 700
  text-transform: uppercase
  letter-spacing: 1.2px
  color: $search-accent

.result-title
  font-family: var(--font-heading)
  font-size: 1.25rem
  font-weight: 700
  color: $search-text
  margin: 0
  line-height: 1.3

.result-abstract
  font-family: var(--font-body)
  font-size: 0.95rem
  line-height: 1.5
  color: $search-text-muted
  margin: 0
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  overflow: hidden

.result-meta
  display: flex
  align-items: center
  gap: 16px
  font-family: var(--font-body)
  font-size: 0.8rem
  color: $search-text-muted
  margin-top: 8px

.result-author
  display: flex
  align-items: center
  gap: 4px

.result-date
  display: flex
  align-items: center
  gap: 4px

.result-score
  color: $search-accent
  font-weight: 600
  display: flex
  align-items: center
  gap: 4px

.search-empty-state
  max-width: 400px
  margin: 60px auto
  text-align: center
  color: $search-text-muted
  p
    margin: 16px 0 24px
    font-size: 1rem

.empty-hint
  font-size: 0.9rem
  color: $search-accent
  font-style: italic

.back-home-link
  text-decoration: none

@media screen and (max-width: 600px)
  .search-page
    padding: 24px 16px 40px
  .search-page-title
    font-size: 1.5rem
  .search-input-wrapper
    flex-direction: column
  .search-btn
    width: 100%
  .search-result-card
    padding: 16px
  .result-title
    font-size: 1.1rem
  .advanced-panel-content
    padding: 16px
  .fuzzy-options, .sort-options
    flex-direction: column
  .fuzzy-btn, .sort-btn
    width: 100%
  .options-row
    flex-direction: column
    align-items: flex-start
  .category-select
    max-width: 100%
</style>