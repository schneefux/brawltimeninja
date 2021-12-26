<template>
  <b-card
    v-if="result == undefined"
    title="Brawler Personality Test"
    md
  >
    <div slot="content" class="relative">
      <p class="font-semibold text-center">Are you an artistic or scientific person?</p>
      <quiz-likert
        slot="content"
        :value="{}"
        :start="0"
        :end="1"
        @input="onTrigger"
      ></quiz-likert>
      <img class="absolute bottom-0 right-2 hidden md:inline w-10" src="~/assets/images/Ranged_Bot.png">
    </div>
  </b-card>

  <b-card
    v-else
    title="Brawler Personality Test"
    :subtitle="`Your Result: ${resultName}`"
    md
  >
    <media-img
      slot="preview"
      :path="`/brawlers/${result}/model`"
      size="256"
      clazz="h-24 md:h-16 my-2"
    ></media-img>
    <b-button
      slot="actions"
      class="mx-auto"
      primary
      md
      @click="onRestart"
    >{{ $t('action.restart') }}</b-button>
  </b-card>
</template>

<script lang="ts">
import { oejtsScores } from '~/lib/oejts'
import { brawlerId } from '~/lib/util'
import { computed, defineComponent, useStore, wrapProperty } from '@nuxtjs/composition-api'

const useGtag = wrapProperty('$gtag', false)
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

    const gtag = useGtag()
    const onTrigger = (m: Record<string, number>) => {
      emit('input', m)
      gtag.event('click', {
        'event_category': 'quiz',
        'event_label': 'start',
      })
    }
    const onRestart = () => {
      emit('input', {})
      gtag.event('click', {
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
