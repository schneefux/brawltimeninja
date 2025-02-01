<template>
  <split-page :title="$t('tier-list.ranked.title')">
    <template v-slot:aside-left>
      <b-scroll-spy
        id="sidenav"
        :sections="sections"
        toc-class="hidden lg:block"
        nav-class="top-14"
      ></b-scroll-spy>
    </template>

    <p id="description" class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.ranked.description') }}
    </p>

    <ad instream></ad>

    <b-page-section
      id="teambuilder"
      ref="draftTool"
      :title="$t('draft-tool.title.short')"
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
        callback: makeVisibilityCallback(`ranked-${mode}`),
        once: true,
      }"
    >
      <events-roll
        :events="events"
        with-data
      ></events-roll>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { BPageSection, BDashboardCell, BScrollSpy } from '@schneefux/klicker/components'
import { ObserveVisibility } from 'vue-observe-visibility'
import { defineComponent, computed, ref, useTemplateRef } from 'vue'
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
    BPageSection,
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
      title: i18n.t('tier-list.ranked.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('tier-list.ranked.meta.description') },
      ]
    }))

    const { makeVisibilityCallback } = useTrackScroll('ranked')

    const modeSectionRefs = ref<Record<string, HTMLElement|null>>({})
    const setModeSectionRef = (id: string, el: HTMLElement|null) => modeSectionRefs.value[id] = el
    const draftToolRef = useTemplateRef<HTMLElement>('draftTool')
    const sections = computed(() => [{
      id: 'team-builder',
      title: i18n.t('draft-tool.title.short'),
      element: draftToolRef.value,
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
    }
  },
})
</script>
