<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// Instanciamos MarkdownIt para procesar el Markdown
const md = new MarkdownIt();
const metadata = ref({});
let metadatatags = ref<string[]>([]);
const htmlContent = ref('');
const rawContent = ref('');

// Capturamos los parámetros de la URL
const route = useRoute();
const year = route.params.year as string;
const slug = route.params.slug as string;
console.log('Parámetros de la ruta:', { year, slug });
console.log('Ruta completa:', route.fullPath);

// Función para extraer metadatos del archivo Markdown
const extractMetadata = (content: string): { metadata: Record<string, string>, text: string, tags: string[] } => {
    let cleantext = content;
    const metadataRegex = /---\s*([\s\S]*?)\s*---/;
    let processedTags: string[] = [];
    const match = content.match(metadataRegex);

    if (match) {
        const metadataString = match[1];
        const metadataLines = metadataString.split('\n');
        const metadata: Record<string, string> = {};

        metadataLines.forEach(line => {
            const [key, ...rest] = line.split(':');
            metadata[key.trim()] = rest.join(':').trim();
        });
        
        cleantext = content.replace(match[0], '').trim();

        if (metadata.tags) {
            processedTags = metadata.tags.split(',').map(tag => tag.trim());
        }

        // Convertir la fecha a formato legible
        if (metadata.date) {
            const dateObj = new Date(metadata.date);
            metadata.date = dateObj.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        return { metadata, text: cleantext, tags: processedTags };
    } else {
        metadatatags.value = [];
    }

    return { metadata: {}, text: content, tags: [] };
};

// Función para cargar y procesar el contenido
const loadAndProcessContent = async (year: string, slug: string) => {
    try {
        // Aquí se accede al archivo .md desde la carpeta 'public'
        const response = await fetch(`/markdowns/${year}/${slug}.md`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const content = await response.text();
        rawContent.value = content;
        const { metadata: extractedMetadata, text, tags } = extractMetadata(content);
        metadata.value = extractedMetadata;
        metadatatags.value = tags;
        htmlContent.value = md.render(text);

        console.log('--- 🏷️ Metadatos Extraídos ---');
        console.log(extractedMetadata);
        console.log('--- 🧼 Texto Markdown Limpio ---');
        console.log(text);

        // 3. CONSOLE.LOG DEL HTML FINAL
        console.log('--- 🌐 HTML Renderizado Final ---');
        console.log(htmlContent.value);
        console.log('----------------------------------');
    } catch (error) {
        console.error('Error fetching the markdown file:', error);
    }
};

// Reaccionamos al cambio de los parámetros de la ruta
watch(
    () => [route.params.year, route.params.slug],  // Observamos los cambios de los parámetros
    ([newYear, newSlug]) => {
        if (newYear && newSlug) {
            loadAndProcessContent(newYear as string, newSlug as string);
        }
    },
    { immediate: true }
);

</script>

<template>
    <div app class="pa-10 ma-10 markdown-view">
        <div class="pb-10 ">
            <h1>{{ metadata.title }}</h1>
            <div class="metadata-container pb-10">
                <div v-if="(Object.keys(metadata).length !== 0) && Object.keys(metadata)[0] !== ''">
                    <div>
                        <span class="font-weight-bold">Escrito por: </span>
                        <span class="lastlinemetadata">{{ metadata.author }}</span>
                    </div>
                    <div>
                        <span class="font-weight-bold">Subido un: </span>
                        <span class="lastlinemetadata">{{ metadata.date }}</span>
                    </div>
                    <div>
                        <span class="font-weight-bold">Resumen: </span>
                        <span class="lastlinemetadata">{{ metadata.abstract }}</span>
                    </div>
                    <div>
                        <span class="font-weight-bold">Etiquetas: </span>
                        <span v-for="tag in metadatatags" :key="tag"> {{ '#' + tag + ' ' }} </span><br />
                    </div>
                </div>
                <div v-if="(Object.keys(metadata).length === 0) || Object.keys(metadata)[0] === ''">
                    <em>No metadata available.</em>
                </div>
            </div>
        </div>
        <article v-html="htmlContent" />
    </div>
</template>
