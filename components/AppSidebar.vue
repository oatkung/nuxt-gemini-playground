<template>
  <ul class="bg-base-200 text-base-content min-h-full w-80 p-4">
    
    <li 
      v-for="menu in menus" 
      :key="menu.title" 
      
    >
      <NuxtLink 
        class="px-2 py-2 hover:bg-base-300 hover:text-ba rounded-md block"
        :class="{ 'bg-base-300 font-bold': $route.path === menu.to }"
       :to="menu.to">{{ menu.title }}
      </NuxtLink>
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
    { to: '/summarize', title: 'Website summarization' },
    { to: '/receipt-ocr', title: 'Receipt ocr' },
    { to: '/recipe-genie', title: 'Recipe genie' },
  ] 
</script>

<style scoped>

</style>