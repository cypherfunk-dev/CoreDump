<template>
    <v-container class="pa-4">
        <v-row justify="center">
            <v-col cols="12" md="8" lg="6">
                <v-card>
                    <v-card-title class="text-h6">Bienvenido a 2025</v-card-title>

                    <v-card-text>
                        Componente index simple con Vuetify.
                        <div class="mt-3">Contador: {{ count }}</div>
                    </v-card-text>

                    <v-card-actions>
                        <v-btn color="primary" @click="count++">Incrementar</v-btn>
                        <v-btn text @click="reset">Reiniciar</v-btn>
                        <v-spacer />
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const reset = () => { count.value = 0 }
</script>

<style scoped>
.v-card {
    overflow: hidden;
}
</style>