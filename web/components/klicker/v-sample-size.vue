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
    query: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { query } = toRefs(props)

    const show = computed(() => query.value.data.length > 0 &&
      (query.value.data[0].meta.picks != undefined || query.value.data[0].measurementsRaw.picks != undefined))

    const sample = computed(() => query.value.data.reduce(
      (agg, e) => agg + parseInt((e.measurementsRaw.picks ?? e.meta.picks) as string), 0))

    const sampleFormatted = computed(() => formatSI(sample.value, 2))

    return {
      show,
      sample,
      sampleFormatted,
    }
  },
})
</script>
