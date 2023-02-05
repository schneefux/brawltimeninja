<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card != undefined && { ...card, title: $t('metric.margin-of-error') }"
    component="v-moe"
    wrapper="b-bigstat"
  >
    <template v-slot:content><p  class="flex items-center">
      <span
        class="text-xl"
        :class="{
          'text-green-400': moe <= 0.01,
          'text-orange-400': moe > 0.01 && moe <= 0.025,
          'text-red-400': moe > 0.025,
        }"
      >{{ moePercent }}</span>
      <span class="ml-2 text-base">
        <template v-if="moe <= 0.005">
          {{ $t('moe.perfect') }}
        </template>
        <template v-if="moe > 0.005 && moe <= 0.01">
          {{ $t('moe.good') }}
        </template>
        <template v-if="moe > 0.01 && moe <= 0.025">
          {{ $t('moe.mediocre') }}
        </template>
        <template v-if="moe > 0.025">
          {{ $t('moe.poor') }}
        </template>
      </span>
    </p></template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CubeResponse } from '@schneefux/klicker/types'
import { VCardWrapper } from '@schneefux/klicker/components'
import { VisualisationProps } from '@schneefux/klicker/props'
import { useBrawlstarsStore } from '@/stores/brawlstars'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const store = useBrawlstarsStore()

    const moe = computed((): number => {
      // margin of error
      // moe = z * standard error
      // for binomial (normal approximation):
      // moe = z * Math.sqrt(p*(1-p)/n)
      // worst case, p=50%
      // best case, n = sample / brawlers
      // (assumes we are slicing Brawlers)
      const sample = (<CubeResponse>props.response).data.reduce((agg, c) => agg + (c.metricsRaw.picks as number), 0)
      return 1.68 * Math.sqrt(0.5 * (1 - 0.5) / (sample / store.totalBrawlers))
    })
    const moePercent = computed((): string => (moe.value * 100).toFixed(2) + '%')

    return {
      moe,
      moePercent,
    }
  },
})
</script>
