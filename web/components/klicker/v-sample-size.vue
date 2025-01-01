<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
  >
    <template v-slot:content>
      <p
        v-if="sample == 0"
        class="text-red-400"
      >
        {{ $t('no-data.please-change-filter') }}
      </p>
      <p v-else>
        {{ $t('sample-size', { count: sampleFormatted }) }}
      </p>
    </template>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CubeResponse } from '@schneefux/klicker/types'
import { formatSI } from '~/lib/util'
import { useCubeResponseProps } from '@schneefux/klicker/composables'
import { VisualisationProps } from '@schneefux/klicker/props'
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
    const { switchResponse } = useCubeResponseProps(props)

    const sample = computed(() => (<CubeResponse> props.response).data.reduce((agg, e) => agg + (e.metricsRaw.picks as number), 0))

    const sampleFormatted = computed(() => {
      const format = (n: number) => formatSI(n).formatted

      return switchResponse((response) => {
        return format(response.data.reduce((agg, e) => agg + (e.metricsRaw.picks as number), 0))
      }, (response) => {
        return response.data
          .reduce((agg, e) => [agg[0] + (e.test.reference.metricsRaw.picks as number), agg[1] + (e.metricsRaw.picks as number)], [0, 0])
          .map(format)
          .join(' / ')
      })
    })

    const vwrapper = useVWrapper(computed(() =>
      props.card != undefined && ({ ...props.card, title: i18n.t('metric.sample-size') })
    ), computed(() => props.loading), 'b-bigstat')

    return {
      vwrapper,
      sample,
      sampleFormatted,
    }
  },
})
</script>
