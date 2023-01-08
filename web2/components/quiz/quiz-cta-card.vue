<template>
  <b-card
    v-if="result == undefined"
    class="max-w-md"
  >
    <template v-slot:content><div  class="relative mt-4">
      <p class="text-center">{{ $t('oejts.cta-question') }}</p>
      <img class="absolute top-[10px] left-0 w-10" src="~/assets/images/organized.png">
      <template v-slot:content><quiz-likert
        
        :value="{}"
        :start="0"
        :end="1"
        @input="onTrigger"
      ></quiz-likert></template>
      <img class="absolute top-[7px] right-0 w-10" src="~/assets/images/chaotic.png">
    </div></template>
  </b-card>

  <b-card
    v-else
    :title="$t('player.quiz.title')"
    :subtitle="$t('oejts.result.short', { brawler: resultName })"
    class="max-w-md"
  >
    <template v-slot:preview><media-img
      
      :path="`/brawlers/${result}/model`"
      size="256"
      clazz="h-24 md:h-16 my-2"
    ></media-img></template>
    <template v-slot:actions><b-button
      
      class="mx-auto"
      primary
      md
      @click="onRestart"
    >{{ $t('action.restart') }}</b-button></template>
  </b-card>
</template>

<script lang="ts">
import { oejtsScores } from '~/lib/oejts'
import { brawlerId } from '~/lib/util'
import { computed, defineComponent, useStore } from 'vue'
import { event } from 'vue-gtag'

export default defineComponent({
  setup(props, { emit }) {
    const store = useStore<any>()
    const resultName = computed(() => store.state['personalityTestResult'])
    const result = computed(() => {
      if (resultName.value == undefined) {
        return undefined
      } else {
        return brawlerId({ name: resultName.value })
      }
    })

    const onTrigger = (m: Record<string, number>) => {
      emit('input', m)
      event('click', {
        'event_category': 'quiz',
        'event_label': 'start',
      })
    }
    const onRestart = () => {
      emit('input', {})
      event('click', {
        'event_category': 'quiz',
        'event_label': 'restart_cta',
      })
    }

    return {
      result,
      resultName,
      onTrigger,
      onRestart,
      oejtsScores,
    }
  },
})
</script>
