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
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import { CubeResponse } from '~/klicker'
import { formatSI } from '~/lib/util'

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

    const show = computed(() => response.value.data.length > 0 && !response.value.comparing &&
      response.value.data[0].measurementsRaw.picks != undefined)

    const sample = computed(() => response.value.data.reduce(
      (agg, e) => agg + (e.measurementsRaw.picks as number), 0))

    const sampleFormatted = computed(() => formatSI(sample.value, 2))

    return {
      show,
      sample,
      sampleFormatted,
    }
  },
})
</script>
