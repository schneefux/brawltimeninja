<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
    title="Last Update"
    dense
  >
    <p
      slot="content"
      class="text-lg"
    >
      {{ lastUpdate }}
    </p>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { CubeResponse } from '~/klicker'

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

    const show = computed(() => query.value.data.length > 0
      && (query.value.data[0].meta.timestamp != undefined || query.value.data[0].measurementsRaw.timestamp != undefined))
    const lastUpdate = computed((): string => {
      const timestamps = query.value.data
        .map(d => d.measurementsRaw.timestamp ?? d.meta.timestamp)
        .sort() as unknown as string[] // TODO
      const timestamp = parseISO(timestamps[timestamps.length - 1])
      if (timestamp.valueOf() == 0) {
        return 'never'
      }
      return formatDistanceToNow(timestamp, { addSuffix: true })
    })

    return {
      show,
      lastUpdate,
    }
  },
})
</script>
