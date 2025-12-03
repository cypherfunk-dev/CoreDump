<script lang="ts" setup>
import image from '../assets/404.jpg';
import siteTexts from '../database/site-texts.json';
</script>

<template>
    <v-container>
        <v-row justify="center" >
            <v-col cols="12" md="8" class="text-center">
                <v-img :src="image" max-width="700" class="mx-auto mb-6" />
            </v-col>
        </v-row>
    </v-container>

</template>