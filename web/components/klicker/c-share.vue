<template>
  <b-button
    v-show="supportsShareApi"
    primary
    sm
    @click="share"
  >
    {{ $t('action.share') }}
  </b-button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { BButton } from '@schneefux/klicker/components'
import { event } from 'vue-gtag'

export default defineComponent({
  components: {
    BButton,
  },
  setup() {
    const supportsShareApi = computed(() => !import.meta.env.SSR && 'share' in navigator)

    const share = async () => {
      try {
        await navigator.share({
          url: window.location.href,
        })
        event('click', {
          'event_category': 'dashboard',
          'event_label': 'share',
        })
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          event('cancel', {
            'event_category': 'dashboard',
            'event_label': 'share',
          })
          return
        }

        console.error(err);
        event('click', {
          'event_category': 'dashboard',
          'event_label': 'share_error',
        })
      }
    }

    return {
      share,
      supportsShareApi,
    }
  },
})
</script>
