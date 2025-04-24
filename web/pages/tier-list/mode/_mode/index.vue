<template>
  <split-page :title="$t('tier-list.mode.title', { mode: $t('mode.' + mode) })">
    <mode-map-jumper
      id="mode-map-jumper"
      :mode="mode"
    ></mode-map-jumper>

    <p id="description" class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.mode.description', { mode: $t('mode.' + mode) }) }}
    </p>

    <ad kind="first"></ad>

    <b-page-section
      id="maps"
      v-if="events != undefined && events.length > 0"
      :title="$t('tier-list.maps.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('maps'),
        once: true,
      }"
    >
      <template v-slot:description>
        <p class="mt-4 prose dark:prose-invert">
          {{ $t('tier-list.open-map') }}
        </p>
      </template>

      <events-roll :events="events"></events-roll>
    </b-page-section>

    <ad></ad>

    <b-page-section id="dashboard">
      <map-views
        :mode="mode"
        ga-category="mode"
      ></map-views>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { camelToKebab, kebabToCamel } from '~/lib/util'
import { BDashboardCell, BPageSection } from '@schneefux/klicker/components'
import { ObserveVisibility } from 'vue-observe-visibility'
import { defineComponent, computed } from 'vue'
import { useTrackScroll } from '~/composables/gtag'
import { useMeta, useCacheHeaders } from '~/composables/compat'
import { useActiveEvents } from '~/composables/dimension-values'
import { useI18n } from 'vue-i18n'
import { useRouteParams } from '~/composables/route-params'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BPageSection,
    BDashboardCell,
  },
  setup() {
    const i18n = useI18n()
    const routeParams = useRouteParams()

    const mode = computed(() => kebabToCamel(routeParams.value!.mode as string))
    const events = useActiveEvents([], computed(() => ({
      mode: [mode.value],
    })), null)

    const modePath = computed(() => `/tier-list/mode/${camelToKebab(mode.value)}`)

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('tier-list.mode.meta.title', { mode: i18n.t('mode.' + mode.value) }),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('tier-list.mode.meta.description', { mode: i18n.t('mode.' + mode.value) }) },
      ]
    }))

    const { makeVisibilityCallback } = useTrackScroll('mode_meta')

    return {
      events,
      mode,
      modePath,
      makeVisibilityCallback,
    }
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
