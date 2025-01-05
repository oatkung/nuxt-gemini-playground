<template>
  <div class="p-6">
    <div class="card bg-base-100">
      <div class="card-body">
        <h2 class="card-title">Receipt OCR</h2>

        <section v-if="step === 1">
          <div class="form-control">
            <div class="label">
              <span class="label-text"></span>
            </div>
            <div>
              <input v-if="!imageUrl" type="file" class="file-input file-input-bordered w-full max-w-xs"
                @change="onFileChange" accept="image/*" />
              <div v-if="imageUrl" class="w-[140px] h-[140px] rounded-xl overflow-hidden relative">
                <img :src="imageUrl" class="w-full h-full object-cover" />
                <a href="#" class="absolute top-1 right-1 text-white shadow-lg" @click="deleteImage">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="4" d="m21 21l-9-9m0 0L3 3m9 9l9-9m-9 9l-9 9" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="form-control w-52">
            <label class="label cursor-pointer">
              <span class="label-text">With OCR</span>
              <input v-model="withOCR" type="checkbox" class="toggle" />
            </label>
          </div>
          <div>
            <button class="btn btn-primary" :disabled="!file || loading" @click="onSubmit">Submit</button>
          </div>
          <hr class="my-4" />
        </section>
        <section v-if="step === 2" class="block xl:flex xl:gap-x-4">
          <div class="w-full xl:w-[400px] flex-shrink-0">
            <div v-if="imageUrl" class="max-w-full">
              <img :src="imageUrl" class="w-full" />
            </div>
            <button class="btn btn-primary mt-4" @click="step = 1">Back</button>
          </div>
          <div class="h-auto xl:h-[calc(100vh-230px)] xl:overflow-y-scroll">
            <div v-if="loading">
              <span class="loading loading-dots loading-xs"></span>
            </div>
            <div v-if="ocrResult" class="p-4 border rounded mb-4">
              <h5 class="mb-2 font-bold text-xl">OCR Data</h5>
              {{ ocrResult }}
            </div>
            <div v-if="result">
              <MDRender v-model="result" />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {  RecipeGenieResponse} from '~/server/api/receipt-ocr';

const notifyStore = useNotifyStore()
const md = ""
const result = ref(md)
const ocrResult = ref('')
const file = ref<File | null>(null)
const withOCR = ref(false)
const imageUrl = ref<string | null>()
const step = ref(1)

const loading = ref(false)

function onFileChange (e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (!f) return
  file.value = f
  renderImage(f)
}

function renderImage (f: File) {
  const reader = new FileReader()

  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(f)
}


async function processFile (file: File) {
  
  loading.value = true

  

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
    file.value = data.files[0]
    renderImage(data?.files[0])
  }
}

function reset () {
  imageUrl.value = null
  file.value = null
  result.value = ''
  ocrResult.value = ''
}
function deleteImage () {
  reset()
}
function onSubmit () {
  if (!file.value) return
  step.value = 2
  processFile(file.value)
}

onMounted(() => {
  document.addEventListener('paste',onPaste)
})

onBeforeUnmount(() => {
  document.removeEventListener('paste',onPaste)
})

</script>