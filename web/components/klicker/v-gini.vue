<template>
  <b-card
    v-if="dimensions.length == 1 && dimensions[0].id == 'brawler' && data.length > 0 && data[0].meta.picks != undefined && !comparing"
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
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, MetaGridEntry } from '~/klicker'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    comparing: {
      type: Boolean,
      required: true
    },
  },
  computed: {
    giniScore(): number {
      const getStat = (r: MetaGridEntry) => parseInt(r.meta.picks as string) as number

      // calculate Gini coefficient
      let absoluteDifference = 0
      let arithmeticMean = 0
      for (const e1 of this.data) {
        arithmeticMean += getStat(e1) / this.data.length
        for (const e2 of this.data) {
          absoluteDifference += Math.abs(getStat(e1) - getStat(e2))
        }
      }
      return absoluteDifference / (2 * Math.pow(this.data.length, 2) * arithmeticMean)
    },
    giniScoreWords(): string[] {
      // results from a hand-drawn sample of different maps and modes:
      // 25%ile 0.225
      // 50%ile 0.32
      // 75%ile 0.425
      // words chosen from http://www.mcdonald.me.uk/storytelling/lichert_article.htm
      return [
        this.$tc('rating.excellence.9'),
        this.$tc('rating.excellence.8'),
        this.$tc('rating.excellence.7'),
        this.$tc('rating.excellence.6'),
        this.$tc('rating.excellence.5'),
        this.$tc('rating.excellence.4'),
        this.$tc('rating.excellence.3'),
        this.$tc('rating.excellence.2'),
        this.$tc('rating.excellence.1'),
        this.$tc('rating.excellence.0'),
      ]
    },
  },
})
</script>
