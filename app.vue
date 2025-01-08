<script setup lang="ts">
const showModal = ref(false)

const caller = ref('')

provide('caller', caller)

</script>

<template>
  <FullScreenModal v-model="showModal" :caller />


  <div class="vstack w-100">
      <img class="img-fluid" src="~/assets/thistledown-banner.png" />

      <ThistledownHeader v-model="showModal" />

      <NuxtPage v-model="showModal" id="main"/>
  </div>

  <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 mt-3 mb-2 px-5 border-top" style="background-color: #dbe4cf;">
    <div class="col-md-4 d-flex align-items-center">
      <a href="/" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
        <svg class="bi" width="30" height="24"><use xlink:href="#bootstrap"></use></svg>
      </a>
      <span class="mb-3 mb-md-0 text-body-secondary">© {{ new Date(Date.now()).getFullYear() }} Thistledown, Inc</span>
    </div>

    <div class="col-md-4 d-flex flex-column text-center justify-content-center">
      <span class="text-body-secondary"> 379 White Mountain Highway, Conway, NH 03818</span>
      <span class="text-body-secondary">(603) 307-0385</span>
    </div>

    <ul class="nav col-md-4 justify-content-end list-unstyled d-flex">
      <li class="ms-3"></li>
      <li class="ms-3"></li>
      <li class="ms-3"></li>
    </ul>
  </footer>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>

<style>
@media print {
   .noprint{ display:none; }
   #printarea { display:block; }
}
</style>
