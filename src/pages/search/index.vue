<script lang="ts" setup>
import { useUiStore, availableCategories, type AdvancedSearchOptions } from '../../stores/ui';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import siteTexts from '@/database/site-texts.json';

const ui = useUiStore();
const router = useRouter();

// Show/hide advanced options panel
const showAdvanced = ref(true); // Start open since no query yet

// Handle search
function handleSearch() {
  if (ui.search && ui.search.trim()) {
    router.push(`/search/${encodeURIComponent(ui.search.trim())}`);
  }
}

// Toggle field in search fields array
function toggleSearchField(field: 'title' | 'tags' | 'abstract' | 'category' | 'author') {
  const fields = [...ui.advancedOptions.searchFields];
  const idx = fields.indexOf(field);
  if (idx > -1) {
    if (fields.length > 1) fields.splice(idx, 1);
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
  author: 'Autor'
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

// Suggestions
const suggestions = computed(() => {
  return ui.getSuggestions(ui.search);
});
</script>

<template>
  <div class="search-page">
    <!-- Search Header -->
    <div class="search-header">
      <h1 class="search-page-title">{{ siteTexts.advancedSearch || 'Búsqueda Avanzada' }}</h1>
      <p class="search-subtitle">Encuentra artículos, tutoriales y más en nuestro archivo</p>
      
      <div class="search-input-wrapper">
        <v-text-field
          v-model="ui.search"
          :placeholder="siteTexts.searchPlaceholder"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          prepend-inner-icon="mdi-magnify"
          class="search-input"
          autofocus
          @keyup.enter="handleSearch"
        />
        <v-btn color="primary" class="search-btn" @click="handleSearch" :disabled="!ui.search?.trim()">
          <v-icon left>mdi-magnify</v-icon>
          Buscar
        </v-btn>
      </div>

      <!-- Suggestions -->
      <div class="suggestions-row" v-if="suggestions.length && ui.search?.length >= 2">
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

    <!-- Empty State - No search yet -->
    <div class="search-welcome">
      <v-icon size="80" color="grey-darken-1">mdi-text-search</v-icon>
      <h2 class="welcome-title">¿Qué estás buscando?</h2>
      <p class="welcome-text">
        Ingresa un término de búsqueda para encontrar artículos, tutoriales y más.
        <br>
        Usa las opciones avanzadas para refinar tus resultados.
      </p>
      <div class="quick-tips">
        <h3 class="tips-title">Tips de búsqueda:</h3>
        <ul class="tips-list">
          <li><strong>Búsqueda exacta:</strong> Encuentra coincidencias precisas</li>
          <li><strong>Búsqueda amplia:</strong> Tolera errores tipográficos</li>
          <li><strong>Combinar con AND:</strong> Todos los términos deben aparecer</li>
          <li><strong>Filtrar por categoría:</strong> Limita resultados a un tema específico</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
$search-bg: #1a1a1a
$search-surface: #242424
$search-accent: #3a7569
$search-text: #f0f0f0
$search-text-muted: #a0a0a0

.search-page
  background: $search-bg
  min-height: 100vh
  padding: 40px 24px 60px

.search-header
  max-width: 800px
  margin: 0 auto 32px
  text-align: center

.search-page-title
  font-family: 'Montserrat', sans-serif
  font-size: 2rem
  font-weight: 700
  color: $search-text
  margin-bottom: 8px

.search-subtitle
  font-family: 'Inter', sans-serif
  font-size: 1rem
  color: $search-text-muted
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
  border: 1px solid rgba(255,255,255,0.08)

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
  font-family: 'Inter', sans-serif
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
  border-top: 1px solid rgba(255,255,255,0.08)
  padding-top: 16px
  margin-top: 8px

// Welcome/Empty State
.search-welcome
  max-width: 600px
  margin: 40px auto
  text-align: center
  color: $search-text-muted

.welcome-title
  font-family: 'Montserrat', sans-serif
  font-size: 1.5rem
  font-weight: 600
  color: $search-text
  margin: 20px 0 12px

.welcome-text
  font-family: 'Inter', sans-serif
  font-size: 1rem
  line-height: 1.6
  margin-bottom: 32px

.quick-tips
  background: $search-surface
  border-radius: 12px
  padding: 24px
  text-align: left

.tips-title
  font-family: 'Montserrat', sans-serif
  font-size: 1rem
  font-weight: 600
  color: $search-text
  margin-bottom: 12px

.tips-list
  font-family: 'Inter', sans-serif
  font-size: 0.9rem
  line-height: 1.8
  padding-left: 20px
  color: $search-text-muted
  strong
    color: $search-accent

@media screen and (max-width: 600px)
  .search-page
    padding: 24px 16px 40px
  .search-page-title
    font-size: 1.5rem
  .search-input-wrapper
    flex-direction: column
  .search-btn
    width: 100%
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
  .quick-tips
    padding: 16px
</style>
