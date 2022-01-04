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
      class="text-lg"
    >
      {{ sampleFormatted }} Battles
    </p>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse, VisualisationProps } from '~/klicker'
import { formatSI } from '~/lib/util'
import { VCardWrapper } from '~/klicker/components'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const sample = computed(() => (<CubeResponse> props.response).data.reduce((agg, e) => agg + (e.measurementsRaw.picks as number), 0))

    const sampleFormatted = computed(() => {
      const format = (n: number) => formatSI(n, 2)

      if (props.response.kind == 'comparingResponse') {
        return (<CubeComparingResponse> props.response).data
          .reduce((agg, e) => [agg[0] + (e.test.reference.measurementsRaw.picks as number), agg[1] + (e.measurementsRaw.picks as number)], [0, 0])
          .map(format)
          .join(' / ')
      } else {
        return format((<CubeResponse> props.response).data.reduce((agg, e) => agg + (e.measurementsRaw.picks as number), 0))
      }
    })

    return {
      sample,
      sampleFormatted,
    }
  },
})
</script>
