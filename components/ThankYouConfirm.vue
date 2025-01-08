<script setup lang="ts">
const showModal = defineModel()
</script>

<template>
    <div class="d-flex flex-column align-items-center justify-content-center" style="height: 85vh;">
        <h1 class="font-libre fw-semibold">Thank you for your interest in Thistledown Recovery Home!</h1>
        <br />
        <h4 class="font-libre w-75 text-center">We have received your application and appreciate your interest. Our team will carefully review the information you provided, and we will contact you if any additional details are needed or if you move forward in the process. If you have any questions in the meantime, please don’t hesitate to reach out to <a href="mailto:info@thistledownrecoveryhome.com"><u>info@thistledownrecoveryhome.com</u></a>. Thank you for taking the time to apply—we look forward to reviewing your application!</h4>
        <br />
        <h2 class="w-75 fst-italic">Best regards, </h2>
        <h2 class="w-75 font-libre">Thistledown Recovery Home</h2>
        <br />
        <button class="btn btn-primary"@click="showModal = !showModal">Close</button>
    </div>
</template>

<!-- <style scoped>

</style> -->