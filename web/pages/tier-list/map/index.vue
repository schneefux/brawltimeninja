<template>
  <split-page :title="$t('tier-list.maps.title')">
    <template v-slot:aside-left>
      <b-scroll-spy
        id="sidenav"
        :sections="sections"
        toc-class="hidden lg:block"
        nav-class="top-14"
      ></b-scroll-spy>
    </template>

    <p id="description" class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.maps.description') }}
    </p>

    <ad instream></ad>

    <b-page-section
      id="active"
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
      id="ranked"
      ref="rankedSection"
      :title="$t('events.ranked.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('ranked_events'),
        once: true,
      }"
      lazy
    >
      <b-button
        :to="localePath('/tier-list/ranked')"
        class="mt-4"
        primary
        sm
      >
        {{ $t('action.open.tier-list.ranked') }}
      </b-button>
    </b-page-section>

    <ad lazy></ad>

    <b-page-section
      id="upcoming"
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

    <ad lazy></ad>

    <b-page-section
      id="season"
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
  </split-page>
</template>

<script lang="ts">
import { computed, defineComponent, useTemplateRef } from 'vue'
import { useCacheHeaders, useConfig, useMeta } from '~/composables/compat'
import { ObserveVisibility } from 'vue-observe-visibility'
import { unformatMode } from '~/lib/util'
import { useTrackScroll } from '~/composables/gtag'
import { BPageSection, BScrollSpy } from '@schneefux/klicker/components'
import { useAllEvents } from '~/composables/dimension-values'
import { useCurrentAndUpcomingEvents } from '~/composables/events'
import { useI18n } from 'vue-i18n'
import { EventMetadata } from '~/plugins/klicker.service'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BPageSection,
    BScrollSpy,
  },
  setup() {
    const i18n = useI18n()
    const $config = useConfig()
    const { current, upcoming } = useCurrentAndUpcomingEvents()

    const allEvents = useAllEvents()

    const allRankedEvents = useAllEvents({
      powerplay: ['true'],
    })

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('tier-list.maps.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('tier-list.maps.meta.description') },
      ],
    }))

    const { makeVisibilityCallback } = useTrackScroll('maps')

    const sectionRefs = {
      activeSection: useTemplateRef<InstanceType<typeof BPageSection>>('activeSection'),
      rankedSection: useTemplateRef<InstanceType<typeof BPageSection>>('rankedSection'),
      upcomingSection: useTemplateRef<InstanceType<typeof BPageSection>>('upcomingSection'),
      seasonSection: useTemplateRef<InstanceType<typeof BPageSection>>('seasonSection'),
    }

    const sections = computed(() => [{
      id: 'active',
      title: i18n.t('events.active.title'),
      element: sectionRefs.activeSection.value?.$el,
    }, {
      id: 'ranked',
      title: i18n.t('events.ranked.title'),
      element: sectionRefs.rankedSection.value?.$el,
    }, {
      id: 'upcoming',
      title: i18n.t('events.upcoming.title'),
      element: sectionRefs.upcomingSection.value?.$el,
    }, {
      id: 'season',
      title: i18n.t('events.season.title'),
      element: sectionRefs.seasonSection.value?.$el,
    }])

    return {
      sections,
      allEvents,
      current,
      upcoming,
      allRankedEvents,
      unformatMode,
      makeVisibilityCallback,
    }
  },
})
</script>
