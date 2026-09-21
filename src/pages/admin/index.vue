<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import { useUiStore } from '@/stores/ui';

// El editor necesita el ancho completo.
useUiStore().sidebar = false;

const API = 'http://localhost:3002/api';
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

// ── Estado de autenticación ──
const isLoggedIn = ref(false);
const loginForm = ref({ username: '', password: '' });
const loginError = ref('');
const token = ref('');

// ── Estado del editor ──
const form = ref({
  title: '',
  date: new Date().toISOString().split('T')[0],
  category: '',
  tags: '',
  author: '',
  abstract: '',
  image: '',
  content: '',
  year: new Date().getFullYear().toString(),
});

const categories = ref<string[]>([]);
const existingImages = ref<string[]>([]);
const snackbar = ref({ show: false, text: '', color: 'success' });
const saving = ref(false);
const rebuilding = ref(false);
const uploading = ref(false);
const lastCreatedSlug = ref('');
const previewTab = ref('editor');

// ── Computed ──
const renderedMarkdown = computed(() => {
  if (!form.value.content) return '<p class="text-grey">Escribe algo en el editor para ver la preview...</p>';
  return md.render(form.value.content);
});

const generatedSlug = computed(() => {
  if (!form.value.title) return '';
  return form.value.title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
});

const frontmatterPreview = computed(() => {
  const lines = ['---'];
  if (form.value.title) lines.push(`title: "${form.value.title}"`);
  if (form.value.date) lines.push(`date: ${form.value.date}`);
  if (form.value.category) lines.push(`category: ${form.value.category}`);
  if (form.value.tags) lines.push(`tags: ${form.value.tags}`);
  if (form.value.author) lines.push(`author: ${form.value.author}`);
  if (form.value.abstract) lines.push(`abstract: ${form.value.abstract}`);
  if (form.value.image) lines.push(`image: ${form.value.image}`);
  lines.push('---');
  return lines.join('\n');
});

const isFormValid = computed(() => {
  return form.value.title.trim() !== '' && form.value.content.trim() !== '';
});

// ── Auth helpers ──
function authHeaders() {
  return { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' };
}

// ── Login ──
async function login() {
  loginError.value = '';
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value),
    });
    const data = await res.json();
    if (!res.ok) {
      loginError.value = data.error || 'Error de autenticación';
      return;
    }
    token.value = data.token;
    isLoggedIn.value = true;
    loadCategories();
    loadImages();
  } catch {
    loginError.value = 'No se pudo conectar al servidor admin (puerto 3001)';
  }
}

function logout() {
  isLoggedIn.value = false;
  token.value = '';
  loginForm.value = { username: '', password: '' };
}

// ── Data loading ──
async function loadCategories() {
  try {
    const res = await fetch(`${API}/categories`, { headers: authHeaders() });
    categories.value = await res.json();
  } catch { /* silencioso */ }
}

async function loadImages() {
  try {
    const res = await fetch(`${API}/images/${form.value.year}`, { headers: authHeaders() });
    existingImages.value = await res.json();
  } catch { /* silencioso */ }
}

// ── Subir imagen ──
async function uploadImage(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploading.value = true;
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API}/upload/${form.value.year}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      form.value.image = data.path;
      showSnack('Imagen subida correctamente', 'success');
      loadImages();
    } else {
      showSnack(data.error || 'Error al subir imagen', 'error');
    }
  } catch {
    showSnack('Error de conexión al subir imagen', 'error');
  } finally {
    uploading.value = false;
    input.value = '';
  }
}

// ── Guardar artículo ──
async function saveArticle() {
  if (!isFormValid.value) return;

  saving.value = true;
  try {
    const res = await fetch(`${API}/articles`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(form.value),
    });
    const data = await res.json();
    if (data.success) {
      lastCreatedSlug.value = data.slug;
      showSnack(`Artículo creado: ${data.filePath}`, 'success');
    } else {
      showSnack(data.error || 'Error al guardar', 'error');
    }
  } catch {
    showSnack('Error de conexión al guardar', 'error');
  } finally {
    saving.value = false;
  }
}

// ── Reconstruir base de datos ──
async function rebuildDatabase() {
  rebuilding.value = true;
  try {
    const res = await fetch(`${API}/rebuild-db`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      showSnack(`DB reconstruida: ${data.output.trim()}`, 'success');
    } else {
      showSnack(data.error || 'Error al reconstruir', 'error');
    }
  } catch {
    showSnack('Error de conexión al reconstruir DB', 'error');
  } finally {
    rebuilding.value = false;
  }
}

// ── Limpiar formulario ──
function clearForm() {
  form.value = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    tags: '',
    author: '',
    abstract: '',
    image: '',
    content: '',
    year: new Date().getFullYear().toString(),
  };
  lastCreatedSlug.value = '';
}

// ── Insertar plantilla markdown ──
function insertTemplate(type: string) {
  const templates: Record<string, string> = {
    heading: '\n## Título de sección\n\n',
    image: '\n![Descripción de la imagen](/images/' + form.value.year + '/nombre.webp)\n\n',
    code: '\n```bash\n# tu código aquí\n```\n\n',
    list: '\n1. Primer elemento\n2. Segundo elemento\n3. Tercer elemento\n\n',
    quote: '\n> Cita o nota importante aquí\n\n',
    table: '\n| Columna 1 | Columna 2 | Columna 3 |\n|-----------|-----------|------------|\n| dato      | dato      | dato       |\n\n',
    bold: '**texto en negrita**',
    italic: '*texto en cursiva*',
    link: '[texto del enlace](https://url.com)',
    divider: '\n---\n\n',
    math: '\n$$\n\\text{tu ecuación aquí}\n$$\n\n',
  };
  form.value.content += templates[type] || '';
}

function showSnack(text: string, color: string) {
  snackbar.value = { show: true, text, color };
}

// Recargar imágenes al cambiar el año
watch(() => form.value.year, () => {
  if (isLoggedIn.value) loadImages();
});
</script>

<template>
  <v-container fluid class="admin-page pa-0">

    <!-- ═══════ LOGIN ═══════ -->
    <div v-if="!isLoggedIn" class="login-wrapper">
      <v-card class="login-card" max-width="420" elevation="12">
        <v-card-title class="login-header">
          <v-icon class="mr-2" color="green-accent-3">mdi-console</v-icon>
          <span class="text-green-accent-3 font-weight-bold mr-1">&gt;</span>
          CoreDump Admin
        </v-card-title>
        <v-card-subtitle class="pb-4 text-grey">Acceso al panel de administración</v-card-subtitle>

        <v-card-text>
          <v-text-field
            v-model="loginForm.username"
            label="Usuario"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-account"
            @keyup.enter="login"
          />
          <v-text-field
            v-model="loginForm.password"
            label="Contraseña"
            variant="outlined"
            density="compact"
            type="password"
            prepend-inner-icon="mdi-lock"
            class="mt-2"
            @keyup.enter="login"
          />
          <v-alert v-if="loginError" type="error" density="compact" class="mt-2" variant="tonal">
            {{ loginError }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn color="green-accent-3" variant="flat" @click="login" block>
            <v-icon left>mdi-login</v-icon>
            Iniciar sesión
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- ═══════ EDITOR ═══════ -->
    <div v-else class="editor-wrapper">

      <!-- Toolbar -->
      <v-toolbar color="transparent" density="compact" class="editor-toolbar">
        <v-icon class="ml-4 mr-2" color="green-accent-3">mdi-pencil</v-icon>
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">
          Editor de Artículos
        </v-toolbar-title>
        <v-spacer />
        <v-chip v-if="generatedSlug" variant="outlined" size="small" class="mr-2" color="grey">
          {{ form.year }}/{{ generatedSlug }}
        </v-chip>
        <v-btn icon size="small" @click="clearForm" title="Limpiar formulario">
          <v-icon>mdi-file-plus-outline</v-icon>
        </v-btn>
        <v-btn icon size="small" @click="logout" title="Cerrar sesión" class="mr-2">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider />

      <div class="editor-body">

        <!-- ── Columna izquierda: Metadata ── -->
        <div class="metadata-panel">
          <h3 class="panel-title">
            <v-icon size="small" class="mr-1">mdi-tag-multiple</v-icon>
            Metadata (Frontmatter)
          </h3>

          <v-text-field
            v-model="form.title"
            label="Título *"
            variant="outlined"
            density="compact"
            hide-details="auto"
            class="mb-3"
            :rules="[v => !!v || 'El título es obligatorio']"
          />

          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="form.date"
                label="Fecha"
                variant="outlined"
                density="compact"
                type="date"
                hide-details
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.year"
                label="Año (carpeta)"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>

          <v-combobox
            v-model="form.category"
            :items="categories"
            label="Categoría"
            variant="outlined"
            density="compact"
            hide-details
            class="mt-3"
          />

          <v-text-field
            v-model="form.tags"
            label="Tags (separados por coma)"
            variant="outlined"
            density="compact"
            hide-details
            placeholder="seguridad, humor, hardware"
            class="mt-3"
          />

          <v-text-field
            v-model="form.author"
            label="Autor"
            variant="outlined"
            density="compact"
            hide-details
            class="mt-3"
          />

          <v-textarea
            v-model="form.abstract"
            label="Resumen"
            variant="outlined"
            density="compact"
            rows="3"
            hide-details
            class="mt-3"
          />

          <!-- Imagen -->
          <h3 class="panel-title mt-6">
            <v-icon size="small" class="mr-1">mdi-image</v-icon>
            Imagen destacada
          </h3>

          <v-text-field
            v-model="form.image"
            label="Ruta de imagen"
            variant="outlined"
            density="compact"
            hide-details
            :placeholder="`/images/${form.year}/nombre.webp`"
            class="mb-2"
          />

          <v-btn
            variant="outlined"
            size="small"
            color="green-accent-3"
            block
            @click="($refs.imageInput as HTMLInputElement).click()"
            :loading="uploading"
            class="mb-3"
          >
            <v-icon left size="small">mdi-upload</v-icon>
            Subir imagen
          </v-btn>
          <input ref="imageInput" type="file" accept="image/*" hidden @change="uploadImage" />

          <!-- Imágenes existentes -->
          <div v-if="existingImages.length" class="existing-images">
            <p class="text-caption text-grey mb-1">Imágenes disponibles ({{ form.year }}):</p>
            <div class="image-grid">
              <div
                v-for="img in existingImages"
                :key="img"
                class="image-thumb"
                :class="{ selected: form.image === img }"
                @click="form.image = img"
              >
                <v-img :src="img" height="50" cover />
                <span class="text-caption">{{ img.split('/').pop() }}</span>
              </div>
            </div>
          </div>

          <!-- Frontmatter preview -->
          <v-expansion-panels class="mt-4">
            <v-expansion-panel>
              <v-expansion-panel-title class="text-caption">
                <v-icon size="small" class="mr-1">mdi-code-braces</v-icon>
                Ver Frontmatter generado
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <pre class="frontmatter-code">{{ frontmatterPreview }}</pre>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>

        <!-- ── Columna derecha: Editor + Preview ── -->
        <div class="content-panel">

          <!-- Tabs Editor / Preview -->
          <v-tabs v-model="previewTab" density="compact" color="green-accent-3" class="editor-tabs">
            <v-tab value="editor">
              <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
              Editor
            </v-tab>
            <v-tab value="preview">
              <v-icon size="small" class="mr-1">mdi-eye</v-icon>
              Preview
            </v-tab>
            <v-tab value="split">
              <v-icon size="small" class="mr-1">mdi-view-split-vertical</v-icon>
              Split
            </v-tab>
          </v-tabs>

          <!-- Toolbar de formato -->
          <div class="format-toolbar">
            <v-btn icon size="x-small" @click="insertTemplate('bold')" title="Negrita">
              <v-icon size="small">mdi-format-bold</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('italic')" title="Cursiva">
              <v-icon size="small">mdi-format-italic</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('heading')" title="Encabezado">
              <v-icon size="small">mdi-format-header-2</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('link')" title="Enlace">
              <v-icon size="small">mdi-link</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('image')" title="Imagen">
              <v-icon size="small">mdi-image</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('code')" title="Bloque de código">
              <v-icon size="small">mdi-code-tags</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('list')" title="Lista">
              <v-icon size="small">mdi-format-list-numbered</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('quote')" title="Cita">
              <v-icon size="small">mdi-format-quote-close</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('table')" title="Tabla">
              <v-icon size="small">mdi-table</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('divider')" title="Separador">
              <v-icon size="small">mdi-minus</v-icon>
            </v-btn>
            <v-btn icon size="x-small" @click="insertTemplate('math')" title="Ecuación">
              <v-icon size="small">mdi-math-integral</v-icon>
            </v-btn>
          </div>

          <!-- Contenido del editor -->
          <div class="editor-content" :class="{ 'split-mode': previewTab === 'split' }">
            <textarea
              v-if="previewTab !== 'preview'"
              v-model="form.content"
              class="markdown-editor"
              placeholder="Escribe tu artículo en Markdown aquí..."
              spellcheck="true"
            />
            <div
              v-if="previewTab !== 'editor'"
              class="markdown-preview markdown-view"
              v-html="renderedMarkdown"
            />
          </div>

          <!-- Barra de acciones -->
          <div class="action-bar">
            <div class="action-bar-left">
              <v-chip size="small" variant="tonal" :color="isFormValid ? 'green' : 'grey'">
                <v-icon start size="small">{{ isFormValid ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
                {{ isFormValid ? 'Listo para guardar' : 'Faltan campos obligatorios' }}
              </v-chip>
              <v-chip v-if="form.content" size="small" variant="text" class="ml-2">
                {{ form.content.split(/\s+/).filter(Boolean).length }} palabras
              </v-chip>
            </div>
            <div class="action-bar-right">
              <v-btn
                variant="outlined"
                color="blue-lighten-2"
                size="small"
                @click="rebuildDatabase"
                :loading="rebuilding"
                class="mr-2"
              >
                <v-icon left size="small">mdi-database-refresh</v-icon>
                Reconstruir DB
              </v-btn>
              <v-btn
                color="green-accent-3"
                variant="flat"
                @click="saveArticle"
                :loading="saving"
                :disabled="!isFormValid"
              >
                <v-icon left>mdi-content-save</v-icon>
                Guardar artículo
              </v-btn>
            </div>
          </div>

          <!-- Resultado -->
          <v-alert
            v-if="lastCreatedSlug"
            type="success"
            variant="tonal"
            class="mt-3 mx-4 mb-4"
            closable
            @click:close="lastCreatedSlug = ''"
          >
            Artículo creado exitosamente.
            <router-link :to="lastCreatedSlug" class="text-green font-weight-bold">
              Ver artículo →
            </router-link>
          </v-alert>
        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" location="bottom right">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   ADMIN PAGE - Estilos completos
   ═══════════════════════════════════════════════════════════ */

.admin-page {
  min-height: 100vh;
  background: #0d0d0d;
}

/* ── LOGIN ── */
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.login-card {
  background: rgba(28, 28, 28, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px !important;
}

.login-header {
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.08em;
  font-size: 1.2rem;
  padding-top: 24px;
}

/* ── EDITOR LAYOUT ── */
.editor-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.editor-toolbar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── METADATA PANEL ── */
.metadata-panel {
  width: 360px;
  min-width: 360px;
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  overflow-y: auto;
  max-height: calc(100vh - 48px);
  background: rgba(18, 18, 18, 0.6);
}

.panel-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

/* ── IMAGES ── */
.existing-images {
  max-height: 200px;
  overflow-y: auto;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.image-thumb {
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  text-align: center;
}

.image-thumb.selected {
  border-color: #69F0AE;
}

.image-thumb:hover {
  border-color: rgba(105, 240, 174, 0.4);
}

.image-thumb .text-caption {
  display: block;
  font-size: 0.6rem;
  padding: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.frontmatter-code {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #69F0AE;
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 6px;
  white-space: pre-wrap;
  margin: 0;
}

/* ── CONTENT PANEL ── */
.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.format-toolbar {
  display: flex;
  gap: 2px;
  padding: 6px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(18, 18, 18, 0.4);
  flex-wrap: wrap;
}

/* ── EDITOR + PREVIEW ── */
.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-content.split-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.editor-content.split-mode .markdown-editor {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.markdown-editor {
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: rgba(12, 12, 12, 0.9);
  color: #e0e0e0;
  border: none;
  outline: none;
  padding: 24px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.7;
  resize: none;
  tab-size: 2;
}

.markdown-editor::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.markdown-preview {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  background: #212121;
  color: #ddd;
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  color: #fff;
  margin: 1.5em 0 0.5em;
  font-family: 'Montserrat', sans-serif;
}

.markdown-preview :deep(h2) {
  border-bottom: 2px solid #3a7569;
  padding-bottom: 5px;
}

.markdown-preview :deep(pre) {
  background: rgba(0, 0, 0, 0.4);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-preview :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
}

.markdown-preview :deep(blockquote) {
  border-left: 3px solid #69F0AE;
  padding-left: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 1em 0;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.markdown-preview :deep(a) {
  color: #69F0AE;
}

.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 12px;
}

.markdown-preview :deep(th) {
  background: rgba(255, 255, 255, 0.05);
}

/* ── ACTION BAR ── */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(18, 18, 18, 0.6);
  flex-wrap: wrap;
  gap: 8px;
}

.action-bar-left {
  display: flex;
  align-items: center;
}

.action-bar-right {
  display: flex;
  align-items: center;
}

/* ── RESPONSIVE ── */
@media (max-width: 960px) {
  .editor-body {
    flex-direction: column;
  }

  .metadata-panel {
    width: 100%;
    min-width: unset;
    max-height: unset;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .editor-content.split-mode {
    grid-template-columns: 1fr;
  }
}
</style>
