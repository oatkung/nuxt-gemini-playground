<template>
  <div class="p-6">
    <div class="card bg-base-100">
      <div class="card-body">
        <h2 class="card-title">Website summarization</h2>
        
        <div class="form-control">
          <div class="label">
            <span class="label-text"></span>
          </div>
          <input v-model="text" type="text" placeholder="Enter url here" class="input input-bordered" />
        </div>
        <div v-if="loading">
          <span class="loading loading-dots loading-xs"></span>
        </div>
        <MDRender v-else v-model="result" >
        </MDRender>
        <div class="card-actions justify-end mt-4">
          <button 
            class="btn btn-primary"
            :class="{ 'btn-disabled': !text }"
            @click="sendMessage(text)" 
          >Analyze</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import MDRender from '~/components/MDRender.vue';
import type { SummarizeRequest, SummarizeResponse } from '~/server/api/summarize';




const text = ref('')
const result = ref('')

const loading = ref(false)



async function sendMessage(message: string) {
  
  
  loading.value = true
  const body: SummarizeRequest = {
    url: text.value
  }
  const response = await $fetch<SummarizeResponse>('/api/summarize', {
    method: 'POST',
    body,
  })

  result.value = response.message
  loading.value = false
}

</script>