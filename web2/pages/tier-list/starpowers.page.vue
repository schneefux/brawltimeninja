<template>
  <b-page :title="$t('tier-list.starpower.title')">
    <accessory-tier-list kind="starpowers"></accessory-tier-list>
  </b-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMeta, useContext } from '@/composables/compat'

export default defineComponent({
  middleware: ['cached'],
  head: {},
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
