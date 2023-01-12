<template>
  <b-page :title="$t('tier-list.maps.title')">
    <p class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.maps.description') }}
     </p>

    <ad
      ad-slot="8877810024"
      first
    ></ad>

    <b-split-dashboard>
      <template v-slot:aside>
        <b-scroll-spy
          :sections="sections"
          nav-class="top-14 lg:top-0"
          toc-class="hidden lg:block"
          class="lg:mt-8 lg:overflow-y-auto hide-scrollbar"
        ></b-scroll-spy>
      </template>

      <b-page-section
        ref="activeSection"
        :title="$t('events.active.title')"
        v-observe-visibility="{
          callback: makeVisibilityCallback('current_events'),
          once: true,
        }"
      >
        <events-roll
          :events="current"
          with-data
        ></events-roll>
      </b-page-section>

      <b-page-section
        ref="powerleagueSection"
        :title="$t('events.powerleague.title')"
        v-observe-visibility="{
          callback: makeVisibilityCallback('powerleague_events'),
          once: true,
        }"
        lazy
      >
        <events-roll
          :events="allPowerLeagueEvents || []"
          with-data
        ></events-roll>
      </b-page-section>

      <ad
        ad-slot="4150756245"
        lazy
      ></ad>

      <b-page-section
        ref="upcomingSection"
        :title="$t('events.upcoming.title')"
        v-observe-visibility="{
          callback: makeVisibilityCallback('upcoming_events'),
          once: true,
        }"
        lazy
      >
        <events-roll
          :events="upcoming"
          with-data
        ></events-roll>
      </b-page-section>

      <b-page-section
        :title="$t('events.season.title')"
        ref="seasonSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('maps'),
          once: true,
        }"
        lazy
      >
        <events-roll
          :events="allEvents"
        ></events-roll>
      </b-page-section>

      <b-page-section
        :title="$t('tier-list.competition-winners.title')"
        ref="competitionWinnersSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('competition-winners'),
          once: true,
        }"
        lazy
      >
        <competition-winner-roll></competition-winner-roll>
      </b-page-section>
    </b-split-dashboard>

    <ad
      ad-slot="3577381889"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useContext, useMeta } from '~/composables/compat'
import { ObserveVisibility } from 'vue-observe-visibility'
import { formatAsJsonLd, unformatMode } from '@/lib/util'
import { ActiveEvent } from '@/model/Api'
import { useTrackScroll } from '~/composables/gtag'
import { BPageSection, BSplitDashboard, BScrollSpy } from '@schneefux/klicker/components'
import { useAllEvents } from '@/composables/dimension-values'
import { useCurrentAndUpcomingEvents } from '@/composables/events'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BPageSection,
    BSplitDashboard,
    BScrollSpy,
  },
  head: {},
  setup() {
    const { $config, i18n } = useContext()
    const { current, upcoming } = useCurrentAndUpcomingEvents()

    const allEvents = useAllEvents()

    const allPowerLeagueEvents = useAllEvents({
      powerplay: ['1'],
    })

    useMeta(() => {
      const description = i18n.tc('tier-list.maps.meta.description', 1)
      const structuredData = (<ActiveEvent[]>[]).concat(current.value, upcoming.value)
        .map((event) => ({
          type: 'application/ld+json',
          json: formatAsJsonLd({
            id: event.id,
            map: (i18n.te(`map.${event.id}`) && i18n.t(`map.${event.id}`) || event.map),
            mode: i18n.t('mode.' + event.mode),
            start: event.start,
            end: event.end,
          }, $config.mediaUrl),
        }))

      return {
        title: i18n.tc('tier-list.maps.meta.title', 1),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ],
        script: structuredData,
      }
    })

    const { makeVisibilityCallback } = useTrackScroll('maps')

    const sectionRefs = {
      activeSection: ref<InstanceType<typeof BPageSection>>(),
      powerleagueSection: ref<InstanceType<typeof BPageSection>>(),
      upcomingSection: ref<InstanceType<typeof BPageSection>>(),
      seasonSection: ref<InstanceType<typeof BPageSection>>(),
      competitionWinnersSection: ref<InstanceType<typeof BPageSection>>(),
    }

    const sections = computed(() => [{
      id: 'active',
      title: i18n.t('events.active.title'),
      element: sectionRefs.activeSection.value?.$el,
    }, {
      id: 'powerleague',
      title: i18n.t('events.powerleague.title'),
      element: sectionRefs.powerleagueSection.value?.$el,
    }, {
      id: 'upcoming',
      title: i18n.t('events.upcoming.title'),
      element: sectionRefs.upcomingSection.value?.$el,
    }, {
      id: 'season',
      title: i18n.t('events.season.title'),
      element: sectionRefs.seasonSection.value?.$el,
    }, {
      id: 'competition-winners',
      title: i18n.t('tier-list.competition-winners.title'),
      element: sectionRefs.competitionWinnersSection.value?.$el,
    }])

    return {
      ...sectionRefs,
      sections,
      allEvents,
      current,
      upcoming,
      allPowerLeagueEvents,
      unformatMode,
      makeVisibilityCallback,
    }
  },
  middleware: ['cached'],
})
</script>
