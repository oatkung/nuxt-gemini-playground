<template>
  <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
    
    <li v-for="menu in menus" :key="menu.title" class="menu-title">
      <NuxtLink :to="menu.to">{{ menu.title }}</NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router';

  interface MenuItem {
    to: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined,
    title: string
  }
  const menus: MenuItem[] = [
    { to: '/', title: 'Sentiment Analysis' },
    { to: '/summarize', title: 'Website summarization' }
  ] 
</script>

<style scoped>

</style>