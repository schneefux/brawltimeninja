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
import { defineComponent, useContext, useMeta } from '@nuxtjs/composition-api'

export default defineComponent({
  head: {},
  middleware: ['cached'],
  setup() {
    const { i18n } = useContext()

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
