<template>
  <page :title="$t('oejts.title')">
    <p class="mb-4">{{ $t('oejts.description') }}</p>
    <quiz-card
      class="mx-auto"
    ></quiz-card>
  </page>
</template>

<script lang="ts">
import { defineComponent, useContext, useMeta } from '@nuxtjs/composition-api'

export default defineComponent({
  head: {},
  meta: {
    title: 'Quiz',
    screen: 'profile',
  },
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
