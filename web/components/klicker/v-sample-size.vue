<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
    title="Sample Size"
    size="w-32"
    dense
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
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse } from '~/klicker'
import { formatSI } from '~/lib/util'

export default defineComponent({
  inheritAttrs: false,
  props: {
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true
    },
  },
  setup(props) {
    const show = computed(() => props.response.data.length > 0 &&
      props.response.data[0].measurementsRaw.picks != undefined)

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
      show,
      sample,
      sampleFormatted,
    }
  },
})
</script>
