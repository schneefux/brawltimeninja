<template>
  <b-card
    v-if="result == undefined"
    class="max-w-md"
  >
    <div slot="content" class="relative mt-4">
      <p class="text-center">{{ $t('oejts.cta-question') }}</p>
      <img class="absolute top-[10px] left-0 w-10" src="~/assets/images/organized.png">
      <quiz-likert
        slot="content"
        :value="{}"
        :start="0"
        :end="1"
        @input="onTrigger"
      ></quiz-likert>
      <img class="absolute top-[7px] right-0 w-10" src="~/assets/images/chaotic.png">
    </div>
  </b-card>

  <b-card
    v-else
    :title="$t('player.quiz.title')"
    :subtitle="$t('oejts.result.short', { brawler: resultName })"
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
