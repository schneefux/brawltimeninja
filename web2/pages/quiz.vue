<template>
  <b-page
    :title="$t('oejts.title')"
    class="max-w-lg"
  >
    <p class="mt-4 mb-8">{{ $t('oejts.description') }}</p>
    <ad
      ad-slot="1985124187"
      banner
    ></ad>
    <quiz-card
      class="mt-8"
    ></quiz-card>
    <ad
      ad-slot="5374523095"
      first
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { useCacheHeaders, useContext, useMeta } from '@/composables/compat'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const { i18n } = useContext()

    useCacheHeaders()
    useMeta(() => {
      const description = i18n.tc('oejts.meta.description')

      return {
        title: i18n.tc('oejts.meta.title'),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ],
      }
    })

    return {}
  },
})
</script>
