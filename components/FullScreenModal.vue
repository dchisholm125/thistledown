<script setup lang="ts">
import { onClickOutside, useMouseInElement } from '@vueuse/core'
import { ref } from 'vue'

defineProps<{
    caller: string,
}>()

const showModal = defineModel()

const matteEl = ref()

const { isOutside } = useMouseInElement(matteEl)

</script>

<template>
    <div style="position: sticky; top: 0; z-index: 2;">
        <div v-if="showModal" 
            class="noprint position-absolute d-flex top-0 left-0 z-3 text-white justify-content-center align-items-center bg-opaque-black" 
            style="height: 100vh; width: 100vw" id="modalDarkBox"
            @click="showModal = isOutside ? false : showModal"
                >
            <div
                ref="matteEl" 
                class="noprint d-flex flex-column justify-content-center align-items-center bg-thistle-ultralight-grey rounded text-black w-75 opacity-100" id="modalMatte"
                style="max-height: 90vh;">

                <HousemateApplication v-if="caller == 'apply'" v-model:showModal="showModal" />

                <RequestInfo v-else v-model:showModal="showModal" />

            </div>
        </div>
    </div>
</template>

<style scoped>
#modalDarkBox{
    display: none;
}
</style>