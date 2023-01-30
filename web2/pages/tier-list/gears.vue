<template>
  <b-page :title="$t('tier-list.gear.title')">
    <accessory-tier-list kind="gears"></accessory-tier-list>
  </b-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMeta, useCacheHeaders } from '@/composables/compat'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const i18n = useI18n()

    useCacheHeaders()
    useMeta(() => {
      const description = i18n.t('tier-list.gear.meta.description')
      return {
        title: i18n.t('tier-list.gear.meta.title'),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })
  }
})
</script>
