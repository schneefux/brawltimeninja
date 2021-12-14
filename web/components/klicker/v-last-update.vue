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
import { CubeComparingResponse, CubeResponse } from '~/klicker'
import { BCard } from '~/klicker/components'

export default defineComponent({
  inheritAttrs: false,
  components: {
    BCard,
  },
  props: {
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true
    },
  },
  setup(props) {
    const { response } = toRefs(props)

    const show = computed(() => response.value.data.length > 0 && response.value.data[0].measurementsRaw.timestamp != undefined)

    const lastUpdate = computed((): string => {
      const timestamps = response.value.data
        .map(d => d.measurementsRaw.timestamp)
        .sort() as unknown as string[] // TODO
      // TODO fix types - fix null checks
      if (timestamps.length == 0) {
        return 'never'
      }
      const timestamp = parseISO(timestamps[timestamps.length - 1])
      if (isNaN(timestamp.valueOf()) || timestamp.valueOf() == 0) {
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
