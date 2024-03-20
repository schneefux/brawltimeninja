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
        event('share', {
          'content_type': 'dashboard',
        })
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          event('cancel_share_dashboard')
          return
        }

        console.error(err);
        event('error_share_dashboard')
      }
    }

    return {
      share,
      supportsShareApi,
    }
  },
})
</script>
