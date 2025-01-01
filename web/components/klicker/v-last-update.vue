<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
  >
    <template v-slot:content>
      <relative-time :timestamp="lastUpdate" add-suffix></relative-time>
    </template>
  </component>
</template>

<script lang="ts">
import { defineComponent, computed, toRef } from 'vue'
import { parseISO } from 'date-fns'
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

    const lastUpdate = computed(() => {
      const timestamps = props.response.data
        .map(d => d.metricsRaw.timestamp)
        .sort() as unknown as string[] // TODO

      // TODO fix types - fix null checks
      if (timestamps.length == 0) {
        return undefined
      }
      const timestamp = parseISO(timestamps[timestamps.length - 1])
      if (isNaN(timestamp.valueOf()) || timestamp.valueOf() == 0) {
        return undefined
      }

      return timestamp
    })

    const vwrapper = useVWrapper(computed(() =>
      props.card != undefined && ({ ...props.card, title: i18n.t('metric.last-update') })
    ), toRef(props, 'loading'), 'b-bigstat')

    return {
      vwrapper,
      lastUpdate,
    }
  },
})
</script>
