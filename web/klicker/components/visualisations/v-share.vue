<template>
  <b-button
    v-if="supportsShareApi"
    slot="content"
    class="my-1"
    secondary
    sm
    @click="share()"
  >
    Share
  </b-button>
</template>

<script lang="ts">
import { computed, defineComponent, wrapProperty } from '@nuxtjs/composition-api'
import BButton from '~/klicker/components/ui/b-button.vue'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  components: {
    BButton,
  },
  setup() {
    const gtag = useGtag()

    const supportsShareApi = computed(() => global.navigator != undefined && 'share' in navigator)

    const share = async() => {
      try {
        await navigator.share({
          url: window.location.href,
        })
        gtag.event('click', {
          'event_category': 'dashboard',
          'event_label': 'share',
        })
      } catch (err) {
        console.error(err);
        gtag.event('click', {
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
