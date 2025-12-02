<script setup lang="ts">
import { useUiStore } from '../stores/ui';

const ui = useUiStore();
const articulosRecientes = [
  {
    titulo: "Cómo integrar autenticación JWT en tu API",
    fecha: "2025-11-29",
    categoria: "Backend",
    autor: "Soporte Técnico",
    resumen: "Guía rápida para implementar JWT con buenas prácticas y manejo de tokens.",
    url: "/articles/2025/apagar-notebook-con-bate-no-es-metodo-recomendado"
  },
  {
    titulo: "Optimizar rendimiento en front con lazy loading",
    fecha: "2025-11-21",
    categoria: "Frontend",
    autor: "Equipo Web",
    resumen: "Estrategias prácticas para mejorar tiempos de carga y UX.",
    url: "/articles/2025/apagar-notebook-con-bate-no-es-metodo-recomendado"
  },
  {
    titulo: "Solución a error 504 en servidores Nginx",
    fecha: "2025-11-10",
    categoria: "Infraestructura",
    autor: "SysAdmin",
    resumen: "Causas comunes y ajustes recomendados para evitar timeouts.",
    url: "/articles/2025/apagar-notebook-con-bate-no-es-metodo-recomendado"

  },
  {
    titulo: "Buenas prácticas para migrar bases de datos",
    fecha: "2025-10-30",
    categoria: "DevOps",
    autor: "DBA",
    resumen: "Checklist para migraciones seguras sin perder datos ni cordura."
  }
];

</script>

<template>
  <v-navigation-drawer app location="right" :width="470" v-model="ui.sidebar" class="bg-darken-4" style="overflow-y: auto !important" >
    <v-list dense>
      <v-img
  :width="300"
  aspect-ratio="16/9"
  cover
  class="mx-auto"
  src="../assets/avatar.png"
></v-img>
      <v-list-item class="text-center">
          <v-list-item-title class="text-h5 font-weight-bold ">Departamento de soporte mental</v-list-item-title>
          <v-list-item-subtitle class="text-subtitle-1 pb-4" >Soportamos máquinas, soportamos personas. Apenas soportamos vivir.</v-list-item-subtitle>
        
      </v-list-item>
    </v-list> 
    <v-divider class="my-2 separator" />
    <!-- card con nube de tags de categorias populares -->
    <v-card class="mx-4 my-4 pa-4 tagscloud" outlined>
      <v-card-title class="text-h6 pb-5">Categorías Populares</v-card-title>
      <v-card-text>
        <v-chip-group
          column
        >
          <v-chip class="ma-2 tag" color="green accent-4" text-color="white">#Backend</v-chip>
          <v-chip class="ma-2 tag" color="green accent-4" text-color="white">#Frontend</v-chip>
          <v-chip class="ma-2 tag" color="green accent-4" text-color="white">#DevOps</v-chip>
          <v-chip class="ma-2 tag" color="green accent-4" text-color="white">#Infraestructura</v-chip>
          <v-chip class="ma-2 tag" color="green accent-4" text-color="white">#Bases de Datos</v-chip>
          <v-chip class="ma-2 tag" color="green accent-4" text-color="white">#Seguridad</v-chip>
          <v-chip class="ma-2 tag" color="green accent-4" text-color="white">#Redes</v-chip>
          <v-chip class="ma-2 tag" color="green accent-4" text-color="white">#Sistemas Operativos</v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
    <v-divider class="my-2 separator" />

      <v-list-item>
        <v-list-item-title class="text-h6 pb-5">Artículos Recientes</v-list-item-title>
        <v-list-item-subtitle>
          <div v-for="articulo in articulosRecientes" :key="articulo.titulo" class="mb-4">
             <router-link :to="articulo.url" class="text-decoration-none">  
            <div class="text-subtitle-1 font-weight-bold">{{ articulo.titulo }}</div>
            <div class="text-caption grey--text pb-3">
              {{ articulo.fecha }} | {{ articulo.categoria }} | por {{ articulo.autor }}
            </div>
            <div class="text-body-2 mt-1 pb-4">
              {{ articulo.resumen }}
            </div>
            <v-divider v-if="articulo !== articulosRecientes[articulosRecientes.length - 1]" class="my-2 separator" />
            </router-link>
          </div>
        </v-list-item-subtitle>
    </v-list-item>

  </v-navigation-drawer>
</template>