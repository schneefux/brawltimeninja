<template>
  <transition name="slide-fade" mode="out-in">
    <div v-if="!triggered">
      <quiz-cta-card
        @update:modelValue="onTrigger"
      ></quiz-cta-card>
    </div>

    <div v-else>
      <transition name="slide-fade" mode="out-in">
        <quiz-likert-card
          v-if="result == undefined"
          :initial-answers="answers"
          @update:modelValue="onResult"
        ></quiz-likert-card>

        <quiz-result-card
          v-else
          :result="result"
          @restart="onRestart"
        ></quiz-result-card>
      </transition>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { OEJTSEntry } from '~/lib/oejts'
import { event } from 'vue-gtag'

export default defineComponent({
  setup(props, { emit }) {
    const triggered = ref(false)
    const answers = ref<Record<string, number>>()
    const result = ref<OEJTSEntry>()

    const onTrigger = (a: Record<string, number>) => {
      emit('interact')
      answers.value = a
      triggered.value = true
    }

    const onResult = (r: OEJTSEntry) => {
      triggered.value = true
      result.value = r
      event('end_quiz', {})
    }

    const onRestart = () => {
      answers.value = undefined
      result.value = undefined
      event('restart_quiz_from_card', {})
    }

    return {
      triggered,
      answers,
      result,
      onResult,
      onTrigger,
      onRestart,
    }
  },
})
</script>
