<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import articulo from '../../articles/1.md?raw';

const md = new MarkdownIt();
let text: string = '';
let metadatatags: string[] = [];
const extractMetadata = (content: string): { metadata: Record<string, string>, text: string } => {
    const metadataRegex = /---\s*([\s\S]*?)\s*---/;
    const match = content.match(metadataRegex);
    if (match) {
        const metadataString = match[1];
        const metadataLines = metadataString.split('\n');
        const metadata: Record<string, string> = {};
        metadataLines.forEach(line => {
            const [key, ...rest] = line.split(':');
            metadata[key.trim()] = rest.join(':').trim();
        });
        // Remove metadata block from content
        text = content.replace(match[0], '').trim();

        // Process tags into an array
        if (metadata.tags) {
            metadata.tags = metadata.tags.replace(/^\[|\]$/g, ''); // Remove brackets if present
            metadatatags = metadata.tags.split(',').map((tag) => tag.trim());
        }
        // convert date to more readable format
        if (metadata.date) {
            const dateObj = new Date(metadata.date);
            metadata.date = dateObj.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }



        return { metadata, text };
    }

    return { metadata: {}, text: '' };
};

const metadata = extractMetadata(articulo);
const html = md.render(text);

</script>

<template>
    <div app class="pa-10 ma-10 markdown-view">
        <div class="pb-10 ">
            <h1>{{ metadata.metadata?.title }}</h1>

            <div class="metadata-container pb-10">
                <div class="">
                    <div>
                        <span class="font-weight-bold">Escrito por: </span>
                        <span class="lastlinemetadata">{{ metadata.metadata?.author }}</span>
                    </div>
                    <div>
                        <span class="font-weight-bold">Subido un: </span>
                        <span class="lastlinemetadata">{{ metadata.metadata?.date }}</span>
                    </div>
                    <div>
                        <span class="font-weight-bold">Resumen: </span>
                        <span class="lastlinemetadata">{{ metadata.metadata?.abstract }}</span>
                    </div>
                </div>
                <span class="font-weight-bold">Etiquetas: </span><span v-for="tag in metadatatags" :key="tag"> {{ '#' +
                    tag + ' ' }} </span><br />
            </div>
        </div>
        <article v-html="html" />
    </div>
</template>