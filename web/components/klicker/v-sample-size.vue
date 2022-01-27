<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: $t('metric.sample-size'), dense: true }"
    component="v-sample-size"
  >
    <p
      v-if="sample == 0"
      slot="content"
      class="text-red-400"
    >
      No data!
      Select a different filter.
    </p>
    <p
      v-else
      slot="content"
      class="text-lg md:text-xl"
    >
      {{ sampleFormatted }} Battles
    </p>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { CubeResponse } from '@schneefux/klicker/types'
import { formatSI } from '~/lib/util'
import { VCardWrapper } from '@schneefux/klicker/components'
import { useCubeResponseProps } from '@schneefux/klicker/composables'
import { VisualisationProps } from '@schneefux/klicker/props'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { switchResponse } = useCubeResponseProps(props)

    const sample = computed(() => (<CubeResponse> props.response).data.reduce((agg, e) => agg + (e.metricsRaw.picks as number), 0))

    const sampleFormatted = computed(() => {
      const format = (n: number) => formatSI(n, 2)

      return switchResponse((response) => {
        return format(response.data.reduce((agg, e) => agg + (e.metricsRaw.picks as number), 0))
      }, (response) => {
        return response.data
          .reduce((agg, e) => [agg[0] + (e.test.reference.metricsRaw.picks as number), agg[1] + (e.metricsRaw.picks as number)], [0, 0])
          .map(format)
          .join(' / ')
      })
    })

    return {
      sample,
      sampleFormatted,
    }
  },
})
</script>
