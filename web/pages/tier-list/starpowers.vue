<template>
  <accessory-tier-list-page kind="starpowers"></accessory-tier-list-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMeta, useCacheHeaders } from '~/composables/compat'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const i18n = useI18n()

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('tier-list.starpower.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('tier-list.starpower.meta.description') },
      ]
    }))
  },
})
</script>
