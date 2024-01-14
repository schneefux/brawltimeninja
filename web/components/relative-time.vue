<template>
  <time :datetime="absoluteISO">
    {{ relativeFormatted }}
  </time>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useFormattedDistanceToNow } from '~/composables/date-fns'

export default defineComponent({
  props: {
    timestamp: {
      type: Date,
      required: false
    },
    addSuffix: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    // render now-relative timestamps on client to prevent SSR hydration mismatches
    const relativeFormatted = useFormattedDistanceToNow(computed(() => props.timestamp), {
      addSuffix: computed(() => props.addSuffix),
    })

    const absoluteISO = computed(() => props.timestamp?.toISOString())

    return {
      relativeFormatted,
      absoluteISO,
    }
  },
})
</script>
