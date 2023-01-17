<template>
  <b-page :title="$t('tier-list.starpower.title')">
    <accessory-tier-list kind="starpowers"></accessory-tier-list>
  </b-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMeta, useContext, useCacheHeaders } from '@/composables/compat'

export default defineComponent({
  setup() {
    const { i18n } = useContext()

    useCacheHeaders()
    useMeta(() => {
      const description = i18n.t('tier-list.starpower.meta.description')
      return {
        title: i18n.t('tier-list.starpower.meta.title'),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })
  },
})
</script>
