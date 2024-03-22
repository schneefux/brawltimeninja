<template>
  <split-page :title="$t('brawlers.title')">
    <p id="description" class="mt-4 prose dark:prose-invert">
      {{ $t('brawlers.description') }}
    </p>

    <brawlers-roll
      id="roll"
      class="mt-8"
    ></brawlers-roll>

    <b-page-section
      id="tier-list"
      :title="$t('tier-list.all.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('widget'),
        once: true,
      }"
    >
      <mode-map-jumper id="mode-map-jumper"></mode-map-jumper>

      <p class="mt-4 prose dark:prose-invert">
        {{ $t('tier-list.brawler.description') }}
      </p>

      <map-views
        id="dashboard"
        ga-category="brawler"
        class="mt-8"
      ></map-views>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'
import { useTrackScroll } from '~/composables/gtag'
import { useCacheHeaders, useMeta } from '~/composables/compat'
import { useI18n } from 'vue-i18n'
import { BPageSection } from '@schneefux/klicker/components'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BPageSection,
  },
  setup() {
    const i18n = useI18n()

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('brawlers.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('brawlers.meta.description') },
      ]
    }))

    const { makeVisibilityCallback } = useTrackScroll('brawler_meta')

    return {
      makeVisibilityCallback,
    }
  },
})
</script>
