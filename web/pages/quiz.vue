<template>
  <b-page
    :title="$t('oejts.title')"
    class="max-w-lg"
  >
    <p id="description" class="mt-4 mb-8">{{ $t('oejts.description') }}</p>
    <ad
      ad-slot="1985124187"
      banner
    ></ad>
    <quiz-card
      id="quiz"
      class="mt-8"
    ></quiz-card>
    <ad
      ad-slot="5374523095"
      first
    ></ad>
  </b-page>
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
