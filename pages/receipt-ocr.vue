<template>
  <div class="p-6">
    <div class="card bg-base-100">
      <div class="card-body">
        <h2 class="card-title">Receipt OCR</h2>
        
        <div class="form-control">
          <div class="label">
            <span class="label-text"></span>
          </div>
          <div>
            <input type="file" 
              class="file-input file-input-bordered w-full max-w-xs" 
              @change="onFileChange" accept="image/*" />
          </div>
        </div>
        <hr class="my-4" />
        <div  v-if="imageUrl" class="mx-auto w-[400px] max-w-full">
          <img :src="imageUrl" class="w-full" />
        </div>
        <div v-if="loading">
          <span class="loading loading-dots loading-xs"></span>
        </div>
        <div v-else-if="result">
          <div>
            <!-- <NuxtMarkdown :source="result" /> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {  RecipeGenieRequest, RecipeGenieResponse} from '~/server/api/recipe-genie';


const result = ref('')
const file = ref<File | null>(null)
const imageUrl = ref<string | null>(null)

const loading = ref(false)

const md = `
# Hello Nuxt!

Welcome to the example of [nuxt-markdown-render](https://github.com/sandros94/nuxt-markdown-render).

`



function onFileChange (e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (!f) return
  file.value = f
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(f)

  sendMessage()
}


async function sendMessage() {
  
  if (!file.value) return
  
  loading.value = true

  const formData = new FormData();
  formData.append('file', file.value);

  const response = await $fetch<RecipeGenieResponse>('/api/receipt-ocr', {
    method: 'POST',
    body: formData,
  })

  result.value = response.message

  loading.value = false
}

</script>