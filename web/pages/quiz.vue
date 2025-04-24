<template>
  <split-page :title="$t('oejts.title')">
    <p id="description" class="mt-4 mb-8">{{ $t('oejts.description') }}</p>

    <ad kind="first"></ad>

    <quiz-card
      id="quiz"
      class="mt-8"
    ></quiz-card>
  </split-page>
</template>

<script lang="ts">
import { useCacheHeaders, useMeta } from '~/composables/compat'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const i18n = useI18n()

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('oejts.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('oejts.meta.description') },
      ],
    }))

    return {}
  },
})
</script>

<route>
{
  meta: {
    topBannerType: 'instream',
  },
}
</route>
