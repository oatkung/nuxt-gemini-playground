<template>
  <article class="prose" v-html="md">
  </article>
</template>

<script setup>
const model = defineModel()
const md = computed(() => {
  return mdToHtml(model.value)
})
</script>

<style lang="scss" scoped>

</style>