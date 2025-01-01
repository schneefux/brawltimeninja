<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
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
  </component>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CubeResponse } from '@schneefux/klicker/types'
import { VisualisationProps } from '@schneefux/klicker/props'
import { calculateMoe, rateMoe } from '~/lib/util'
import { useAllBrawlersCount } from '~/composables/dimension-values'
import { useVWrapper, vwrappers } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    ...vwrappers,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const i18n = useI18n()
    const brawlersCount = useAllBrawlersCount()

    const moe = computed((): number => {
      const sample = (<CubeResponse>props.response).data
        .map(c => c.metricsRaw.picks as number)
        .reduce((agg, p) => agg + p, 0)
      return calculateMoe(sample, brawlersCount.value)
    })
    const moePercent = computed((): string => (moe.value * 100).toFixed(2) + '%')
    const moeRating = computed(() => rateMoe(moe.value))

    const vwrapper = useVWrapper(computed(() =>
      props.card != undefined && ({ ...props.card, title: i18n.t('metric.margin-of-error') })
    ), computed(() => props.loading), 'b-bigstat')

    return {
      vwrapper,
      moe,
      moeRating,
      moePercent,
    }
  },
})
</script>
