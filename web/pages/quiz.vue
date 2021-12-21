<template>
  <page :title="$t('oejts.title')">
    <p class="mb-4">{{ $t('oejts.description') }}</p>
    <transition name="slide-fade" mode="out-in">
      <quiz-cta-card
        v-if="step == 0"
        class="mx-auto"
      ></quiz-cta-card>

      <quiz-likert-card
        v-if="step == 1"
        class="mx-auto"
        @input="r => setResult(r)"
      ></quiz-likert-card>

      <quiz-result-card
        v-if="step == 2"
        :result="oejtsResult"
        class="mx-auto"
        @restart="restart()"
      ></quiz-result-card>
    </transition>
  </page>
</template>

<script lang="ts">
import { OEJTSEntry } from '~/lib/oejts'
import { computed, defineComponent, ref, useContext, useMeta, useRoute, wrapProperty } from '@nuxtjs/composition-api'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  head: {},
  meta: {
    title: 'Quiz',
    screen: 'profile',
  },
  middleware: ['cached'],
  setup() {
    const { app: { i18n } } = useContext()

    const route = useRoute()
    const oejtsResult = ref<OEJTSEntry>()
    const step = computed(() => {
      if (!('start' in route.value.query)) {
        return 0
      }
      if (oejtsResult.value == undefined) {
        return 1
      }
      return 2
    })

    const gtag = useGtag()
    const restart = () => {
      oejtsResult.value = undefined
      gtag.event('click', {
        'event_category': 'quiz',
        'event_label': 'restart',
      })
    }

    const setResult = (r: OEJTSEntry) => {
      oejtsResult.value = r
      gtag.event('click', {
        'event_category': 'quiz',
        'event_label': 'end',
      })
    }

    useMeta(() => {
      const description = i18n.tc('oejts.meta.description')

      return {
        title: i18n.tc('oejts.meta.title'),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ],
      }
    })

    return {
      oejtsResult,
      setResult,
      restart,
      step,
    }
  },
})
</script>
