<template>
  <split-page
    :title="$t('tier-list.mode.title', {
      mode: $t('mode.' + mode),
      date,
    })"
    :sections="sections"
  >
    <mode-map-jumper
      id="mode-map-jumper"
      :mode="mode"
      class="mt-4"
    ></mode-map-jumper>

    <p id="description" class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.mode.description', { mode: $t('mode.' + mode) }) }}
    </p>

    <ad kind="first"></ad>

    <b-page-section>
      <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <expand
          size="h-72"
          static
          @expand="scrollToDashboard"
        >
          <map-best-brawlers-table
            ref="bestBrawlersSection"
            v-observe-visibility="{
              callback: makeVisibilityCallback('best_brawlers'),
              once: true,
            }"
            :slices="slices"
            :limit="3"
          ></map-best-brawlers-table>
        </expand>
        <expand size="h-72">
          <survey-tier-list
            ref="tierlistSection"
            v-observe-visibility="{
              callback: makeVisibilityCallback('tierlist'),
              once: true,
            }"
            :mode="mode"
          ></survey-tier-list>
        </expand>
      </div>
    </b-page-section>

    <ad></ad>

    <b-page-section
      id="maps"
      ref="mapsSection"
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

    <b-page-section
      :title="$t('tier-list.mode.dashboard', {
        mode: $t('mode.' + mode),
      })"
      id="dashboard"
      ref="dashboardSection"
    >
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
import { defineComponent, computed, useTemplateRef } from 'vue'
import { useTrackScroll } from '~/composables/gtag'
import { useMeta, useCacheHeaders } from '~/composables/compat'
import { useActiveEvents } from '~/composables/dimension-values'
import { useI18n } from 'vue-i18n'
import { useRouteParams } from '~/composables/route-params'
import { useFormattedDate } from '~/composables/date-fns'

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
    const date = useFormattedDate(new Date(), 'MMMM yyyy')

    const mode = computed(() => kebabToCamel(routeParams.value!.mode as string))
    const events = useActiveEvents([], computed(() => ({
      mode: [mode.value],
    })), null)

    const modePath = computed(() => `/tier-list/mode/${camelToKebab(mode.value)}`)

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('tier-list.mode.meta.title', {
        mode: i18n.t('mode.' + mode.value),
        date: date.value,
      }),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('tier-list.mode.meta.description', { mode: i18n.t('mode.' + mode.value) }) },
      ]
    }))

    const { makeVisibilityCallback } = useTrackScroll('mode_meta')

    const sectionRefs = {
      bestBrawlersSection: useTemplateRef<InstanceType<typeof BPageSection>>('bestBrawlersSection'),
      tierlistSection: useTemplateRef<InstanceType<typeof BPageSection>>('tierlistSection'),
      mapsSection: useTemplateRef<InstanceType<typeof BPageSection>>('mapsSection'),
      dashboardSection: useTemplateRef<InstanceType<typeof BPageSection>>('dashboardSection'),
    }

    const sections = computed(() => [{
      id: 'brawlers',
      title: i18n.t('best.brawlers.for.mode', {
        mode: i18n.t('mode.' + mode.value),
      }),
      element: sectionRefs.bestBrawlersSection.value?.$el,
    }, {
      id: 'tierlist',
      title: i18n.t('tier-list.mode.tier-list', {
        mode: i18n.t('mode.' + mode.value),
      }),
      element: sectionRefs.tierlistSection.value?.$el,
    }, {
      id: 'maps',
      title: i18n.t('tier-list.maps.title'),
      element: sectionRefs.mapsSection.value?.$el,
    }, {
      id: 'dashboard',
      title: i18n.t('tier-list.mode.dashboard', {
        mode: i18n.t('mode.' + mode.value),
      }),
      element: sectionRefs.dashboardSection.value?.$el,
    }])

    const slices = computed(() => ({
      mode: [mode.value],
    }))

    const scrollToDashboard = () => {
      const dashboardSection = sectionRefs.dashboardSection.value
      if (dashboardSection) {
        dashboardSection.$el.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return {
      events,
      date,
      mode,
      modePath,
      sections,
      slices,
      scrollToDashboard,
      makeVisibilityCallback,
    }
  },
})
</script>
