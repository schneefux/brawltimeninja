<template>
  <split-page
    :title="$t('page.tier-list.brawlers.title', {
      date,
    })"
    :sections="sections"
  >
    <template v-slot:aside-left>
      <mode-map-jumper></mode-map-jumper>
    </template>

    <p class="mt-4 prose dark:prose-invert">
      {{ $t('page.tier-list.brawlers.intro') }}
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
            id="best-brawlers"
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
          <async-survey-tier-list
            id="tierlist"
            ref="tierlistSection"
            v-observe-visibility="{
              callback: makeVisibilityCallback('tierlist'),
              once: true,
            }"
            :slices="slices"
          ></async-survey-tier-list>
        </expand>
      </div>
    </b-page-section>

    <ad></ad>

    <b-page-section
      :title="$t('page.tier-list.brawlers.brawlers-title')"
      id="brawlers"
      ref="brawlersSection"
    >
      <p class="mt-4 prose dark:prose-invert">
        {{ $t('page.tier-list.brawlers.brawlers-description') }}
      </p>

      <brawlers-roll
        class="mt-8"
      ></brawlers-roll>
    </b-page-section>

    <ad></ad>

    <b-page-section
      :title="$t('component.dashboard.long')"
      id="dashboard"
      ref="dashboardSection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('widget'),
        once: true,
      }"
    >
      <map-views
        ga-category="brawler"
        class="mt-8"
      ></map-views>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent, hydrateOnInteraction, useTemplateRef } from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'
import { useTrackScroll } from '~/composables/gtag'
import { useCacheHeaders, useMeta } from '~/composables/compat'
import { useI18n } from 'vue-i18n'
import { BPageSection, BCard } from '@schneefux/klicker/components'
import { useFormattedDate } from '~/composables/date-fns'
import { formatClickhouseDate, getMonthSeasonEnd } from '~/lib/util'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BCard,
    BPageSection,
    AsyncSurveyTierList: defineAsyncComponent({
      loader: () => import('~/components/survey-tier-list.vue'),
      hydrate: hydrateOnInteraction('click')
    }),
  },
  setup() {
    const i18n = useI18n()
    const date = useFormattedDate(new Date(), 'MMMM yyyy')

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('page.tier-list.brawlers.meta-title', {
        date: date.value,
      }),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('page.tier-list.brawlers.meta-description') },
      ]
    }))

    const { makeVisibilityCallback } = useTrackScroll('brawler_meta')

    const sectionRefs = {
      bestBrawlersSection: useTemplateRef<InstanceType<typeof BPageSection>>('bestBrawlersSection'),
      tierlistSection: useTemplateRef<InstanceType<typeof BPageSection>>('tierlistSection'),
      brawlersSection: useTemplateRef<InstanceType<typeof BPageSection>>('brawlersSection'),
      dashboardSection: useTemplateRef<InstanceType<typeof BPageSection>>('dashboardSection'),
    }

    const sections = computed(() => [{
      id: 'best-brawlers',
      title: i18n.t('component.best-brawlers.long'),
      element: sectionRefs.bestBrawlersSection.value?.$el,
    }, {
      id: 'tierlist',
      title: i18n.t('component.tier-list.long'),
      element: sectionRefs.tierlistSection.value?.$el,
    }, {
      id: 'brawlers',
      title: i18n.t('page.tier-list.brawlers.brawlers-title'),
      element: sectionRefs.bestBrawlersSection.value?.$el,
    }, {
      id: 'dashboard',
      title: i18n.t('component.dashboard.long'),
      element: sectionRefs.dashboardSection.value?.$el,
    }])

    const scrollToDashboard = () => {
      const dashboardSection = sectionRefs.dashboardSection.value
      if (dashboardSection) {
        dashboardSection.$el.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const slices = computed(() => ({
      season: [formatClickhouseDate(getMonthSeasonEnd())],
    }))

    return {
      date,
      slices,
      sections,
      scrollToDashboard,
      makeVisibilityCallback,
    }
  },
})
</script>
