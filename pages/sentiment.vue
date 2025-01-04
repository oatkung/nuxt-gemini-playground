<template>
  <div class="p-6">
    <div class="card bg-base-100">
      <div class="card-body">
        <h2 class="card-title">Sentiment Analysis</h2>
        <p class="text-neutral text-sm">
          Analyze the sentiment of the following Tweets and classify them as
          POSITIVE,
          NEGATIVE, or NEUTRAL.</p>
        <div>
          <template v-for="chat in chats">
            <div class="chat chat-end" v-if="chat.isUser">
              <div class="chat-bubble">{{ chat.message }}</div>
            </div>
            <div class="chat chat-start" v-else>
              <div class="chat-bubble chat-bubble-primary" >{{ chat.message }}</div>
            </div>
          </template>
          <div class="chat chat-start" v-if="loading">
            <div class="chat-bubble chat-bubble-primary" >
              <span class="loading loading-dots loading-xs"></span>
            </div>
          </div>
        </div>
        <div class="form-control">
          <div class="label">
            <span class="label-text"></span>
          </div>
          <textarea v-model="text" class="textarea textarea-bordered h-24" placeholder="Enter text here"></textarea>
        </div>
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
import type { SentimentRequest, SentimentResponse } from '~/server/api/sentiment';


interface Chat {
  message: string
  isUser: boolean
}


const text = ref('')

const loading = ref(false)



const chats = ref<Chat[]>([
  
])


async function sendMessage(message: string) {
  chats.value.push({
    message,
    isUser: true
  })
  text.value = ''
  loading.value = true
  const body: SentimentRequest = {
    message
  }
  const result = await $fetch<SentimentResponse>('/api/sentiment', {
    method: 'POST',
    body,
  })

  chats.value.push({
    message: result.message,
    isUser: false
  })
  loading.value = false
}

</script>