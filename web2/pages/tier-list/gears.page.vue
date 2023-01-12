<template>
  <b-page :title="$t('tier-list.gear.title')">
    <accessory-tier-list kind="gears"></accessory-tier-list>
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
      const description = i18n.t('tier-list.gear.meta.description') as string
      return {
        title: i18n.t('tier-list.gear.meta.title') as string,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })
  }
})
</script>
