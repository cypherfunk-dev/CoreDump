<template>
    <v-container class="wrapper-main-secondary" >
        <v-row justify="center" >
            <v-col>
                <v-card class="main-article-index">
                    <v-card-title>
                        <h1>Welcome to Our Blog</h1>
                    </v-card-title>
                    <v-card-text>
                        <p>Discover the latest articles, insights, and stories from our community. Stay updated with new
                            content and explore various topics that interest you.</p>
                            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="4">
                <v-card class="secondary-article-index">
                    <v-card-title>
                        <h1>Welcome to Our Blog</h1>
                    </v-card-title>
                    <v-card-text>
                        <p>Discover the latest articles, insights, and stories from our community. Stay updated with new
                            content and explore various topics that interest you.</p>
                    </v-card-text>
                </v-card>

                <v-card class="secondary-article-index">
                    <v-card-title>
                        <h1>Welcome to Our Blog</h1>
                    </v-card-title>
                    <v-card-text>
                        <p>Discover the latest articles, insights, and stories from our community. Stay updated with new
                            content and explore various topics that interest you.</p>
                    </v-card-text>
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