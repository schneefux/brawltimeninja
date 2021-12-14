<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
    :title="$t('metric.balance-rating')"
    size="w-44"
    dense
  >
    <b-button
      slot="preview"
      to="/faq/measuring-map-quality"
      class="my-px"
      dark
      xs
    >?</b-button>
    <p
      slot="content"
      class="text-center leading-none"
    >
      <span
        class="text-lg font-bold"
        :class="{
          'text-red-400': giniScore > 0.4,
          'text-orange-400': giniScore > 0.3 && giniScore <= 0.4,
          'text-green-400': giniScore <= 0.3,
        }"
      >{{ giniScore == undefined ? '?' : giniScoreWords[Math.floor(giniScore * 10)] }}</span>
      <br>
      <span class="text-xs">{{ $t('metric.gini-coefficient') }}: {{ giniScore == undefined ? '?' : giniScore.toFixed(2) }}</span>
    </p>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import { CubeResponse, MetaGridEntry } from '~/klicker'

export default defineComponent({
  inheritAttrs: false,
  props: {
    response: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { response } = toRefs(props)

    const show = computed(() => response.value.query.dimensionsIds.length == 1
      && response.value.query.dimensionsIds[0] == 'brawler'
      && response.value.data.length > 0
      && response.value.data[0].measurementsRaw.useRate != undefined
      && !response.value.comparing
    )

    const giniScore = computed((): number => {
      const getStat = (r: MetaGridEntry) => r.measurementsRaw.useRate as number

      // calculate Gini coefficient
      let absoluteDifference = 0
      let arithmeticMean = 0
      for (const e1 of response.value.data) {
        arithmeticMean += getStat(e1) / response.value.data.length
        for (const e2 of response.value.data) {
          absoluteDifference += Math.abs(getStat(e1) - getStat(e2))
        }
      }
      return absoluteDifference / (2 * Math.pow(response.value.data.length, 2) * arithmeticMean)
    })

    const { app: { i18n } } = useContext()
    // results from a hand-drawn sample of different maps and modes:
    // 25%ile 0.225
    // 50%ile 0.32
    // 75%ile 0.425
    // words chosen from http://www.mcdonald.me.uk/storytelling/lichert_article.htm
    const giniScoreWords = [
      i18n.tc('rating.excellence.9'),
      i18n.tc('rating.excellence.8'),
      i18n.tc('rating.excellence.7'),
      i18n.tc('rating.excellence.6'),
      i18n.tc('rating.excellence.5'),
      i18n.tc('rating.excellence.4'),
      i18n.tc('rating.excellence.3'),
      i18n.tc('rating.excellence.2'),
      i18n.tc('rating.excellence.1'),
      i18n.tc('rating.excellence.0'),
    ]

    return {
      show,
      giniScore,
      giniScoreWords,
    }
  },
})
</script>
