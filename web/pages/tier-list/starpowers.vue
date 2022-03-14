<template>
  <b-page :title="$t('tier-list.starpower.title')">
    <accessory-tier-list kind="starpowers"></accessory-tier-list>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, useMeta, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  middleware: ['cached'],
  head: {},
  meta: {
    title: 'Star Powers',
    screen: 'brawlers',
  },
  setup() {
    const { i18n } = useContext()

    useMeta(() => {
      const description = i18n.t('tier-list.starpower.meta.description') as string
      return {
        title: i18n.t('tier-list.starpower.meta.title') as string,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })
  },
})
</script>
