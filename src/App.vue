<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Authentication from '@/components/Authentication.vue'
</script>

<template>
  <Authentication>
    <RouterView />
  </Authentication>
</template>
