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
            <input type="file" class="file-input file-input-bordered w-full max-w-xs" @change="onFileChange"
              accept="image/*" />
          </div>
        </div>
        <div class="form-control w-52">
          <label class="label cursor-pointer">
            <span class="label-text">With OCR</span>
            <input v-model="withOCR" type="checkbox" class="toggle" />
          </label>
        </div>
        <hr class="my-4" />
        <div v-if="imageUrl" class="mx-auto w-[400px] max-w-full">
          <img :src="imageUrl" class="w-full" />
        </div>
        <div v-if="loading">
          <span class="loading loading-dots loading-xs"></span>
        </div>
        <div v-if="ocrResult" class="p-4 border rounded">
          <h5 class="mb-2 font-bold text-lg">OCR Data</h5>
          {{ ocrResult }}
        </div>
        <div v-if="result">
          <MDRender v-model="result" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {  RecipeGenieResponse} from '~/server/api/receipt-ocr';

const notifyStore = useNotifyStore()
const result = ref('')
const ocrResult = ref('')
const file = ref<File | null>(null)
const withOCR = ref(false)
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
  processFile(f)
}


async function processFile (file: File) {
  
  loading.value = true

  const reader = new FileReader()

  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file) 

  const formData = new FormData();
  formData.append('file', file);
  if (withOCR.value) {
    formData.append('ocr', 'true');
  }

  result.value = ''

  try {
    const response = await $fetch<RecipeGenieResponse>('/api/receipt-ocr', {
      method: 'POST',
      body: formData,
    })
  
    result.value = response.message
    ocrResult.value = response.ocr || ''
  } catch (error) {
    notifyStore.notify(error, NotificationType.Error);
  } finally {
    loading.value = false
  }
}


function onPaste(e: ClipboardEvent) {

  const data = e.clipboardData
  if (data?.files.length) {
    const file = data.files[0]
    processFile(file)
  }
}

onMounted(() => {
  document.addEventListener('paste',onPaste)
})

onBeforeUnmount(() => {
  document.removeEventListener('paste',onPaste)
})

</script>