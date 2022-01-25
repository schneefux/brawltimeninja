<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: $t('metric.margin-of-error'), dense: true }"
    component="v-moe"
  >
    <p
      slot="content"
      class="text-center leading-none"
    >
      <span
        :class="['text-lg md:text-xl', {
          'text-green-400': moe <= 0.01,
          'text-orange-400': moe > 0.01 && moe <= 0.025,
          'text-red-400': moe > 0.025,
        }]"
      >{{ moePercent }}</span>
      <br>
      <span class="text-sm">
        <template v-if="moe <= 0.005">
          (perfect accuracy)
        </template>
        <template v-if="moe > 0.005 && moe <= 0.01">
          (good accuracy)
        </template>
        <template v-if="moe > 0.01 && moe <= 0.025">
          (mediocre accuracy)
        </template>
        <template v-if="moe > 0.025">
          (poor accuracy)
        </template>
      </span>
    </p>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent, useStore } from '@nuxtjs/composition-api'
import { CubeResponse } from 'klicker/types'
import { VCardWrapper } from 'klicker/components'
import { VisualisationProps } from 'klicker/props'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const store = useStore<any>()

    const moe = computed((): number => {
      // margin of error
      // moe = z * standard error
      // for binomial (normal approximation):
      // moe = z * Math.sqrt(p*(1-p)/n)
      // worst case, p=50%
      // best case, n = sample / brawlers
      // (assumes we are slicing Brawlers)
      const sample = (<CubeResponse>props.response).data.reduce((agg, c) => agg + (c.measurementsRaw.picks as number), 0)
      return 1.68 * Math.sqrt(0.5 * (1 - 0.5) / (sample / store.state.totalBrawlers))
    })
    const moePercent = computed((): string => (moe.value * 100).toFixed(2) + '%')

    return {
      moe,
      moePercent,
    }
  },
})
</script>
