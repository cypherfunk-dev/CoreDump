<script setup>
import base from '@/database/db.json'
import timeformat from '@/utils/dateparser.ts'

</script>

<template >
    <div class="index-container">
    <div class="parent">
        <div class="div1">
            <v-card class="h-100 d-flex flex-column justify-end pb-5"  >
                <v-container class="pa-0">
                    <v-card-title class="text-wrap" style="">{{ base[0].metadata.title }}</v-card-title>
                    <v-card-subtitle>{{ base[0].metadata.author }}</v-card-subtitle>
                    <v-card-subtitle>{{ timeformat().format(new Date(base[0].metadata.date)) }}</v-card-subtitle>
                </v-container>
            </v-card>
        </div>
        <div class="div2">
            <v-card class="h-100 d-flex flex-column pt-5">
                <v-card-title class="text-wrap text-body-1 " style="">{{ base[1].metadata.title }}</v-card-title>
                <v-card-subtitle class="index-text-sm">{{ base[1].metadata.author }}</v-card-subtitle>
                <v-card-subtitle class="index-text-sm">{{ timeformat().format(new Date(base[1].metadata.date))
                    }}</v-card-subtitle>
            </v-card>
        </div>
        <div class="div3">
            <v-card class="h-100 d-flex flex-column pt-5">
                <v-card-title class="text-wrap text-body-1" style="">{{ base[2].metadata.title }}</v-card-title>

            </v-card>
        </div>
        <div class="div4">
            <v-card class="h-100 d-flex flex-column justify-end pb-5">
                <v-card-title class="text-wrap" style="">{{ base[3].metadata.title }}</v-card-title>
                <v-card-subtitle class="index-text-sm">{{ base[3].metadata.author }}</v-card-subtitle>
                <v-card-subtitle class="index-text-sm">{{ timeformat().format(new Date(base[3].metadata.date))
                    }}</v-card-subtitle>
            </v-card>
        </div>
        <div class="div5">
            <v-card class="h-100 d-flex flex-column pt-5">
                <v-card-title class="text-wrap text-body-1">{{ base[4].metadata.title }}</v-card-title>

            </v-card>
        </div>
        <div class="div6">
            <v-card class="h-100 d-flex flex-column justify-center">
                <v-card-title class="text-wrap text-body-1" style="">{{ base[5].metadata.title }}</v-card-title>
                <v-card-subtitle class="index-text-sm">{{ base[5].metadata.author }}</v-card-subtitle>
                <v-card-subtitle class="index-text-sm">{{ timeformat().format(new Date(base[5].metadata.date))
                    }}</v-card-subtitle>
            </v-card>
        </div>
    </div>
    </div>
</template>
