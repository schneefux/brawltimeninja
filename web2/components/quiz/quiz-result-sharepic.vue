<template>
  <div class="flex justify-center gap-6 items-center flex-wrap bg-gray-800 px-3">
    <div class="flex flex-col items-center">
      <span class="mt-1 font-semibold">{{ result.name }}</span>
      <span class="whitespace-nowrap">{{ Math.round(result.similarity * 100) }}% match</span>
      <media-img
        :path="`/brawlers/${result.id}/model`"
        clazz="h-48 m-2"
      ></media-img>
    </div>

    <oejts-table
      :oejts="result.score"
      class="w-80"
    ></oejts-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QuizResult } from './quiz-result-card.vue'

export default defineComponent({
  props: {
    result: {
      type: Object as PropType<QuizResult>,
      required: true
    },
  },
})
</script>
