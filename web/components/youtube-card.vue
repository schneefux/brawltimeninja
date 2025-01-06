<template>
  <b-card
    :class="['relative', {
      'hidden': youtubeBannerDismissed,
    }]"
    :title="$t('banner.youtube.title')"
  >
    <template v-slot:content>
      <div>
        <button
          class="absolute top-0 right-0 mr-3 mt-2"
          @click="dismissYoutube"
        >
          <fa
            :icon="faTimes"
            class="inline"
          ></fa>
        </button>
        <p>
          {{ $t('banner.youtube.catchphrase') }}
        </p>
      </div>
    </template>

    <template v-slot:actions>
      <b-button
        class="mx-auto"
        href="https://youtube.com/@brawltimeninja?sub_confirmation=1"
        md
        primary
        @click="clickYoutube"
      >
        <fa
          :icon="faYoutube"
          class="mr-1"
        ></fa>
        {{ $t('action.subscribe') }}
      </b-button>
    </template>
  </b-card>
</template>

<script lang="ts">
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import { defineComponent, computed } from 'vue'
import { BCard, BButton, Fa } from '@schneefux/klicker/components'
import { usePreferencesStore } from '~/stores/preferences'
import { event } from 'vue-gtag'

export default defineComponent({
  components: {
    Fa,
    BButton,
    BCard,
  },
  setup() {
    const store = usePreferencesStore()

    const dismissYoutube = () => {
      event('dismissed_youtube')
      store.youtubeBannerDismissed = true
      console.log('dismissed youtube')
    }
    const clickYoutube = () => {
      event('clicked_youtube')
      store.youtubeBannerDismissed = true
      console.log('clicked youtube')
    }

    const youtubeBannerDismissed = computed(() => store.youtubeBannerDismissed)

    return {
      faTimes,
      faYoutube,
      youtubeBannerDismissed,
      dismissYoutube,
      clickYoutube,
    }
  },
})
</script>
