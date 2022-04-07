<template>
  <b-page :title="$t('tier-list.mode.title', { mode: $t('mode.' + mode) })">
    <mode-map-jumper
      :mode="mode"
    ></mode-map-jumper>

    <p class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.mode.description', { mode: $t('mode.' + mode) }) }}
    </p>

    <ad
      ad-slot="2291234880"
      first
    ></ad>

    <b-page-section
      v-if="events != undefined && events.length > 0"
      :title="$t('tier-list.maps.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('maps'),
        once: true,
      }"
    >
      <p
        slot="description"
        class="mt-4 prose dark:prose-invert"
      >
        {{ $t('tier-list.open-map') }}
      </p>

      <events-roll :events="events"></events-roll>
    </b-page-section>

    <ad
      ad-slot="2263314723"
      lazy
    ></ad>

    <b-page-section>
      <map-views
        :mode="mode"
        ga-category="mode"
      ></map-views>
    </b-page-section>

    <ad
      ad-slot="8497550588"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { camelToKebab, kebabToCamel } from '@/lib/util'
import { BTextbox, CDashboardCell } from '@schneefux/klicker/components'
import { defineComponent, useAsync, computed, useRoute, useContext, useMeta } from '@nuxtjs/composition-api'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  components: {
    BTextbox,
    CDashboardCell,
  },
  head: {},
  meta: {
    screen: 'events',
  },
  middleware: ['cached'],
  setup() {
    const { i18n, $klicker } = useContext()

    const route = useRoute()

    const mode = computed(() => kebabToCamel(route.value.params.mode))
    const events = useAsync(() => $klicker.queryActiveEvents([], {
      mode: [mode.value],
    }, null), `mode-${route.value.params.mode}`)

    const modePath = computed(() => `/tier-list/mode/${camelToKebab(mode.value)}`)

    useMeta(() => {
      const description = i18n.tc('tier-list.mode.meta.description', 1, { mode: i18n.t('mode.' + mode.value) as string })
      return {
        title: i18n.tc('tier-list.mode.meta.title', 1, { mode: i18n.t('mode.' + mode.value) as string }),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })

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
