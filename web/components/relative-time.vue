<template>
  <time :datetime="absoluteFormatted">
    {{ relativeFormatted }}
  </time>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useDateFnLocale } from '~/composables/date-fns'
import { useIntervalFn } from '@vueuse/core'

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
    const { locale } = useDateFnLocale()
    // render now-relative timestamps only on client to prevent SSR hydration mismatches
    const relativeFormatted = ref('…')

    const absoluteFormatted = computed(() => props.timestamp?.toISOString())

    const updateFormatted = () => {
      if (props.timestamp == undefined) {
        relativeFormatted.value = 'never'
      } else {
        relativeFormatted.value = formatDistanceToNow(props.timestamp, {
          addSuffix: true,
          locale: locale.value,
        })
      }
    }
    useIntervalFn(updateFormatted, 60 * 1000)
    watch(() => props.timestamp, updateFormatted)
    onMounted(updateFormatted)

    return {
      relativeFormatted,
      absoluteFormatted,
    }
  },
})
</script>
