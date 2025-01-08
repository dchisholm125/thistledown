<script setup lang="ts">
const props = defineProps<{
    labelStr: string,
    inputType: string,
    notRequired?: boolean, // comes in as TRUE, and forces required to be FALSE
}>()

const textInput = defineModel<string | boolean | Date>()

let staticTextInput = ref<string>()

const textarea = ref()

onMounted(() => {
    staticTextInput.value = textInput.value as string
})

</script>

<template>
<div class="mb-3">
    <label :for="staticTextInput" class="form-label">{{ labelStr }}</label>
    <div v-if="inputType == 'radio'">
        <div class="form-check">
            <input class="form-check-input" type="radio" :name="labelStr" :id="labelStr + '1'" @click="textInput = true" :required="notRequired ? !notRequired : true">
            <label class="form-check-label" for="textInput1">
                Yes
            </label>
        </div>
        <div class="form-check">
            <input class="form-check-input" type="radio" :name="labelStr" :id="labelStr + '2'" @click="textInput = false" :required="notRequired ? !notRequired : true">
            <label class="form-check-label" for="textInput2">
                No
            </label>
        </div>
    </div>
    <textarea v-else-if="inputType == 'textarea'" ref="textarea" class="form-control" :id="staticTextInput" @input="textInput = textarea.value" :required="notRequired ? !notRequired : true"></textarea>
    <input v-else v-model="textInput" :type="inputType" class="form-control" :id="staticTextInput" :required="notRequired ? !notRequired : true" />
</div>
</template>

<style scoped>
input:invalid, textarea:invalid{
    border-width: 2px;
    border-color: red;
}
</style>