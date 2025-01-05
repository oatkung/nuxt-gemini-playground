<template>
  <div class="p-6">
    <div class="card bg-base-100">
      <div class="card-body">
        <h2 class="card-title">Recipe Genie</h2>
        
        <div class="form-control">
          <div class="label">
            <span class="label-text"></span>
          </div>
          <div>
            <input type="file" 
              class="file-input file-input-bordered w-full max-w-xs" 
              @change="onFileChange" accept="image/*"
            />
          </div>
        </div>
        <hr class="my-4" />
        <div  v-if="imageUrl" class="mx-auto w-[400px] max-w-full">
          <img :src="imageUrl" class="w-full" />
        </div>
        <MDRender v-model="result" />
        <span v-if="loading" class="loading loading-dots loading-xs"></span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import MDRender from '~/components/MDRender.vue';
import type {  RecipeGenieRequest, RecipeGenieResponse} from '~/server/api/recipe-genie-stream';

const notifyStore = useNotifyStore()

const result = ref('')
const file = ref<File | null>(null)
const imageUrl = ref<string | null>(null)

const loading = ref(false)

// const md = `
// # Hello Nuxt!

// Welcome to the example of [nuxt-markdown-render](https://github.com/sandros94/nuxt-markdown-render).

// `



function onFileChange (e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (!f) return
  processFile(f)
}

function processFile (f: File) {
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
  
  result.value = ''
  loading.value = true

  const formData = new FormData();
  formData.append('file', file.value);

  try {
    const response = await $fetch<ReadableStream>('/api/recipe-genie-stream', {
      method: 'POST',
      body: formData,
      responseType: 'stream',
    })

    const reader = response.pipeThrough(new TextDecoderStream()).getReader()

    // Read the chunk of data as we get it
    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }
      result.value += value
    }
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