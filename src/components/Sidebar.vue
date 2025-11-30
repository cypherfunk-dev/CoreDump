<script setup lang="ts">
const articulosRecientes = [
  {
    titulo: "Cómo integrar autenticación JWT en tu API",
    fecha: "2025-11-29",
    categoria: "Backend",
    autor: "Soporte Técnico",
    resumen: "Guía rápida para implementar JWT con buenas prácticas y manejo de tokens."
  },
  {
    titulo: "Optimizar rendimiento en front con lazy loading",
    fecha: "2025-11-21",
    categoria: "Frontend",
    autor: "Equipo Web",
    resumen: "Estrategias prácticas para mejorar tiempos de carga y UX."
  },
  {
    titulo: "Solución a error 504 en servidores Nginx",
    fecha: "2025-11-10",
    categoria: "Infraestructura",
    autor: "SysAdmin",
    resumen: "Causas comunes y ajustes recomendados para evitar timeouts."
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
  <v-navigation-drawer app permanent location="right" :width="470">
    <v-list dense>
    </v-list>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="text-h6 pb-5">Artículos Recientes</v-list-item-title>
        <v-list-item-subtitle>
          <div v-for="articulo in articulosRecientes" :key="articulo.titulo" class="mb-4">
            <div class="text-subtitle-1 font-weight-bold">{{ articulo.titulo }}</div>
            <div class="text-caption grey--text pb-3">
              {{ articulo.fecha }} | {{ articulo.categoria }} | por {{ articulo.autor }}
            </div>
            <div class="text-body-2 mt-1 pb-4">
              {{ articulo.resumen }}
            </div>
            <v-divider v-if="articulo !== articulosRecientes[articulosRecientes.length - 1]" class="my-2 separator" />

          </div>

        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

  </v-navigation-drawer>
</template>

<script setup lang="ts">
</script>

<style scoped></style>