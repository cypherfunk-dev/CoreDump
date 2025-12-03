        <script setup lang="ts">
import { useUiStore } from '../stores/ui';
import siteTexts from '../database/site-texts.json';
import { ref } from 'vue';
const ui = useUiStore();
const searchField = ref(null);
</script>
        
        
        <template>
        <v-expand-x-transition>

            <div v-if="ui.searchbar" v-click-outside="ui.onClickOutside" style="width: 500px;" class="mr-2">
                <VTextField ref="searchField" v-model="ui.search" density="compact"
                    :placeholder="siteTexts.searchPlaceholder" variant="solo-filled" flat single-line hide-details
                    @input="ui.queryChange(ui.search)" />
            </div>
        </v-expand-x-transition>
        </template>