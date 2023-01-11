<template>
  <b-page :title="$t('tier-list.gadget.title')">
    <accessory-tier-list kind="gadgets"></accessory-tier-list>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, useMeta, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  middleware: ['cached'],
  head: {},
  setup() {
    const { i18n } = useContext()

    useMeta(() => {
      const description = i18n.t('tier-list.gadget.meta.description') as string
      return {
        title: i18n.t('tier-list.gadget.meta.title') as string,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })
  },
})
</script>
