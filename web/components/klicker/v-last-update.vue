<template>
  <v-card-wrapper
    :card="card != undefined && { ...card, title: $t('metric.last-update') }"
    :loading="loading"
    :value="lastUpdate"
    component="v-last-update"
    wrapper="b-bigstat"
  >
    <template v-slot:content>
      <time :datetime="lastUpdateAbsolute">
        {{ lastUpdate }}
      </time>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, computed } from 'vue'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { VCardWrapper } from '@schneefux/klicker/components'
import { VisualisationProps } from '@schneefux/klicker/props'
import { useDateFnLocale } from '~/composables/date-fns'
import { useIntervalFn } from '@vueuse/core'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { locale } = useDateFnLocale()
    // render now-relative timestamps only on client to prevent SSR hydration mismatches
    const lastUpdate = ref('…')

    const lastUpdateAbsolute = computed(() => {
      const timestamps = props.response.data
        .map(d => d.metricsRaw.timestamp)
        .sort() as unknown as string[] // TODO

      // TODO fix types - fix null checks
      if (timestamps.length == 0) {
        return 'never'
      }
      const timestamp = parseISO(timestamps[timestamps.length - 1])
      if (isNaN(timestamp.valueOf()) || timestamp.valueOf() == 0) {
        return 'never'
      }

      return timestamp.toISOString()
    })

    const updateLastUpdate = () => {
      lastUpdate.value = formatDistanceToNow(lastUpdateAbsolute.value, {
        addSuffix: true,
        locale: locale.value,
      })
    }
    useIntervalFn(updateLastUpdate, 60 * 1000)
    watch(lastUpdateAbsolute, updateLastUpdate)
    onMounted(updateLastUpdate)

    return {
      lastUpdate,
      lastUpdateAbsolute,
    }
  },
})
</script>
