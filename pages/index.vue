<template>
  <div class="p-6">
    <div class="card bg-base-100">
      <div class="card-body">
        <h2 class="card-title">Welcome</h2>
        <div>
          {{  result  }}
        </div>
      </div>
      <pre v-html="md" />
    </div>
  </div>
</template>
<script setup lang="ts">
const result = ref('')


const md = computed(() => {
  return mdToHtml(result.value)
})
async function loadData () {
  const response = await $fetch<ReadableStream>('/api/stream-test', {
    method: 'GET',
    responseType: 'stream',
  })

  const reader = response.pipeThrough(new TextDecoderStream()).getReader()

  // Read the chunk of data as we get it
  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      console.log('Finished')
      break
    }

    result.value += value
  }
}

onMounted(() => {
  // loadData()
})

</script>