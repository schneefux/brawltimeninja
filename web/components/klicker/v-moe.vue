<template>
  <v-card-wrapper
    :card="card != undefined && { ...card, title: $t('metric.margin-of-error') }"
    :loading="loading"
    component="v-moe"
    wrapper="b-bigstat"
  >
    <template v-slot:content>
      <p class="flex items-center">
        <span
          :class="{
            'text-green-400': moe <= 0.01,
            'text-orange-400': moe > 0.01 && moe <= 0.025,
            'text-red-400': moe > 0.025,
          }"
          class="text-xl"
        >{{ moePercent }}</span>
        <span class="ml-2 text-base">
          {{ $t('moe.' + moeRating) }}
        </span>
      </p>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CubeResponse } from '@schneefux/klicker/types'
import { VCardWrapper } from '@schneefux/klicker/components'
import { VisualisationProps } from '@schneefux/klicker/props'
import { calculateMoe, rateMoe } from '~/lib/util'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const moe = computed((): number => {
      const sample = (<CubeResponse>props.response).data
        .map(c => c.metricsRaw.picks as number)
        .reduce((agg, p) => agg + p, 0)
      return calculateMoe(sample)
    })
    const moePercent = computed((): string => (moe.value * 100).toFixed(2) + '%')
    const moeRating = computed(() => rateMoe(moe.value))

    return {
      moe,
      moeRating,
      moePercent,
    }
  },
})
</script>
