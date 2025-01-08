<script setup lang="ts">
const showModal = defineModel()

</script>

<template>
    <Content v-model="showModal"/>
</template>

<style>
@keyframes fadeIn {
    0% {
        background-color: rgba(0, 0, 0, 0);
        font-size: 18pt;
        color: black;
    }
    100% {
        background-color: rgba(0, 0, 0, 0.048);
        border-radius: 10px;
        font-size: 19pt;
        color: blue;
    }
}

.banner-height {
    height: 80vh;
}

.bg-opaque-black {
    background-color: rgba(0, 0, 0, 0.75);
}

.bg-opaque-white {
    background-color: rgba(255, 255, 255, 0.75);
}

.bg-thistle-ultralight-grey {
    background-color: #ecebe4;
}

.bg-thistle-tan-drk {
    background-color: #dbe4cf;
}

.bg-thistle-light-gray {
    background-color: #d9d5cd;

}

.bg-heros {
    background-color: #e9efec95;
}

.thistledown-logo {
    color: #69765E;
}

.text-thistledown {
    color: #545454;
}

.text-charcoal {
    color: #242525;
    font-weight: bold;
}

.font-libre {
  font-family: 'Libre Baskerville';
}

.font-lato {
  font-family: 'Lato';
}

a {
    padding: 5px;
    text-decoration: none;
    color: #545454;
}

a:hover {
    padding: 5px;
    border-radius: 5px;
    background-color: rgba(196, 184, 155, 0.829);
    color: #2c2c2c;
}

p, a, .playfair-display-thistledown {
  font-family: sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}

.font-skinny {
    font-weight: 400;
}
</style>