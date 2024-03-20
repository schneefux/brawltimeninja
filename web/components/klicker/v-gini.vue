<template>
  <v-card-wrapper
    :card="card != undefined ? { ...card, title: $t('metric.balance-rating'), tooltipLink: '/faq/measuring-map-quality' } : undefined"
    :loading="loading"
    component="v-gini"
    wrapper="b-bigstat"
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
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { VCardWrapper } from '@schneefux/klicker/components'
import { VisualisationProps } from '@schneefux/klicker/props'
import { useI18n } from 'vue-i18n'
import { calculateGini } from '~/lib/util'

export default defineComponent({
  components: {
    VCardWrapper,
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

    return {
      giniScore,
      giniScoreWords,
    }
  },
})
</script>
