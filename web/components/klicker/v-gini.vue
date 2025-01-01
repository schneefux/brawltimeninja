<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
  >
    <template v-slot:content>
      <p>
        <span
          class="text-xl"
          :class="{
            'text-red-400': giniScore > 0.4,
            'text-orange-400': giniScore > 0.3 && giniScore <= 0.4,
            'text-green-400': giniScore <= 0.3,
          }"
        >{{ giniScore == undefined ? '?' : giniScoreWords[Math.floor(giniScore * 10)] }}</span>
        <span>
          ({{ giniScore == undefined ? '?' : giniScore.toFixed(2) }})
        </span>
      </p>
    </template>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { VisualisationProps } from '@schneefux/klicker/props'
import { useI18n } from 'vue-i18n'
import { calculateGini } from '~/lib/util'
import { useVWrapper, vwrappers } from '@schneefux/klicker/composables'

export default defineComponent({
  components: {
    ...vwrappers,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const giniScore = computed((): number => {
      const useRates = props.response.data.map(r => r.metricsRaw.useRate as number)
      return calculateGini(useRates)
    })

    const i18n = useI18n()
    // results from a hand-drawn sample of different maps and modes:
    // 25%ile 0.225
    // 50%ile 0.32
    // 75%ile 0.425
    // words chosen from http://www.mcdonald.me.uk/storytelling/lichert_article.htm
    const giniScoreWords = [
      i18n.t('rating.excellence.9'),
      i18n.t('rating.excellence.8'),
      i18n.t('rating.excellence.7'),
      i18n.t('rating.excellence.6'),
      i18n.t('rating.excellence.5'),
      i18n.t('rating.excellence.4'),
      i18n.t('rating.excellence.3'),
      i18n.t('rating.excellence.2'),
      i18n.t('rating.excellence.1'),
      i18n.t('rating.excellence.0'),
    ]

    const vwrapper = useVWrapper(computed(() =>
      props.card != undefined && ({ ...props.card, title: i18n.t('metric.balance-rating'), tooltipLink: '/faq/measuring-map-quality' })
    ), computed(() => props.loading), 'b-bigstat')

    return {
      vwrapper,
      giniScore,
      giniScoreWords,
    }
  },
})
</script>
