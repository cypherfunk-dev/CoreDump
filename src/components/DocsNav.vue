<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { docsNav } from '@/stores/ui';
import type { DocNode } from '@/content/types';
import { useTexts } from '@/utils/i18n';

const props = withDefaults(defineProps<{ nodes?: DocNode[]; expanded?: boolean }>(), {
  nodes: () => docsNav,
  expanded: false,
});
const route = useRoute();
const texts = useTexts();
const open = ref(props.expanded);

const isActive = (node: DocNode) => node.url === route.path;
</script>

<template>
  <nav class="docs-tree" :aria-label="texts.docs">
    <button v-if="!expanded" class="docs-tree-toggle d-md-none" @click="open = !open">
      {{ texts.docs }}
      <v-icon size="small">{{ open ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </button>
    <ul :class="{ 'docs-tree-collapsed': !open && !expanded }">
      <li v-for="node in nodes" :key="node.url ?? node.title">
        <router-link v-if="node.url" :to="node.url" :class="{ active: isActive(node) }">{{ node.title }}</router-link>
        <span v-else class="docs-tree-section">{{ node.title }}</span>
        <ul v-if="node.children.length">
          <li v-for="child in node.children" :key="child.url ?? child.title">
            <router-link v-if="child.url" :to="child.url" :class="{ active: isActive(child) }">{{ child.title }}</router-link>
            <span v-else class="docs-tree-section">{{ child.title }}</span>
            <ul v-if="child.children.length">
              <li v-for="leaf in child.children" :key="leaf.url ?? leaf.title">
                <router-link v-if="leaf.url" :to="leaf.url" :class="{ active: isActive(leaf) }">{{ leaf.title }}</router-link>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.docs-tree ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.docs-tree ul ul {
  padding-left: 14px;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-left: 4px;
}

.docs-tree li {
  margin: 6px 0;
}

.docs-tree a {
  display: block;
  padding: 4px 8px;
  border-radius: 6px;
  color: inherit;
  opacity: 0.75;
  text-decoration: none;
  font-size: 0.9rem;
}

.docs-tree a:hover,
.docs-tree a.active {
  opacity: 1;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.docs-tree-section {
  display: block;
  padding: 4px 8px;
  font-family: var(--font-heading);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.6;
}

.docs-tree-toggle {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-family: var(--font-heading);
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 959px) {
  .docs-tree-collapsed {
    display: none;
  }
}
</style>
