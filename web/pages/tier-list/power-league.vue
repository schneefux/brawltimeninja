<template>
  <b-page :title="$t('tier-list.powerleague.title')">
    <p id="description" class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.powerleague.description') }}
    </p>

    <ad
      ad-slot="2291234880"
      first
    ></ad>

    <b-split-dashboard>
      <template v-slot:aside>
        <b-scroll-spy
          id="sidenav"
          :sections="sections"
          nav-class="top-14 lg:top-0"
          toc-class="hidden lg:block"
          class="lg:mt-8 lg:overflow-y-auto hide-scrollbar"
        ></b-scroll-spy>
      </template>

      <b-page-section
        id="teambuilder"
        :title="$t('draft-tool.title.short')"
        ref="draftTool"
        v-observe-visibility="{
          callback: makeVisibilityCallback('team-builder'),
          once: true,
        }"
      >
        <p class="prose dark:prose-invert">
          {{ $t('draft-tool.description.short') }}
        </p>
        <b-button
          :to="localePath('/team-builder')"
          class="mt-4"
          primary
          sm
        >
          {{ $t('action.open.draft-tool') }}
        </b-button>
      </b-page-section>

      <b-page-section
        v-for="(events, mode) in eventsByMode"
        :id="`maps-${mode}`"
        :title="$t(`mode.${mode}`)"
        :ref="el => setModeSectionRef(mode, el as any)"
        v-observe-visibility="{
          callback: makeVisibilityCallback(`powerleague-${mode}`),
          once: true,
        }"
      >
        <events-roll
          :events="events"
          with-data
        ></events-roll>
      </b-page-section>
    </b-split-dashboard>

    <ad
      ad-slot="8497550588"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { BPage, BPageSection, BDashboardCell, BScrollSpy, BSplitDashboard } from '@schneefux/klicker/components'
import { ObserveVisibility } from 'vue-observe-visibility'
import { defineComponent, computed, ref } from 'vue'
import { useTrackScroll } from '~/composables/gtag'
import { useMeta, useCacheHeaders } from '~/composables/compat'
import { useActiveEvents } from '~/composables/dimension-values'
import { useI18n } from 'vue-i18n'
import { EventMetadata } from '~/plugins/klicker.service'
import { camelToKebab } from '~/lib/util'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BPage,
    BPageSection,
    BSplitDashboard,
    BDashboardCell,
    BScrollSpy,
  },
  setup() {
    const i18n = useI18n()

    const events = useActiveEvents([], {
      powerplay: ['true'],
    }, null)

    const eventsByMode = computed(() => events.value.reduce((map, event) => ({
      ...map,
      [event.mode]: [...(map[event.mode] ?? []), event],
    }), {} as Record<string, EventMetadata[]>))

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('tier-list.powerleague.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('tier-list.powerleague.meta.description') },
      ]
    }))

    const { makeVisibilityCallback } = useTrackScroll('powerleague')

    const modeSectionRefs = ref<Record<string, HTMLElement|null>>({})
    const setModeSectionRef = (id: string, el: HTMLElement|null) => modeSectionRefs.value[id] = el
    const draftTool = ref<HTMLElement>()
    const sections = computed(() => [{
      id: 'team-builder',
      title: i18n.t('draft-tool.title.short'),
      element: draftTool.value,
    }, ...[...Object.keys(eventsByMode.value)].map(mode => ({
      id: camelToKebab(mode),
      title: i18n.t(`mode.${mode}`),
      element: modeSectionRefs.value[mode] ?? undefined,
    }))])

    return {
      sections,
      setModeSectionRef,
      eventsByMode,
      makeVisibilityCallback,
      draftTool,
    }
  },
})
</script>
