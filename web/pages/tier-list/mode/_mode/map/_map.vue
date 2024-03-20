<template>
  <b-page
    v-if="event != undefined"
    :title="$t('tier-list.map.title', { map: mapName })"
  >
    <mode-map-jumper
      id="mode-map-jumper"
      :mode="event.mode"
      :map="event.map"
      :event-id="event.id"
    ></mode-map-jumper>

    <template v-if="aiReport != undefined">
      <client-only>
        <template v-slot:placeholder>
          <ai-report-1
            :timestamp="aiReport.timestamp"
            :title="`${$t('mode.' + event.mode)} - ${mapName}`"
            :content="aiReport.html"
            @interact="trackInteraction('map-report-cta')"
          ></ai-report-1>
        </template>

        <experiment experiment-id="map-report">
          <template v-slot:none></template>
          <template v-slot:cta>
            <ai-report-1
              :timestamp="aiReport.timestamp"
              :title="`${$t('mode.' + event.mode)} - ${mapName}`"
              :content="aiReport.html"
              @interact="trackInteraction('map-report-cta')"
            ></ai-report-1>
          </template>
          <template v-slot:fadeout>
            <ai-report-2
              :timestamp="aiReport.timestamp"
              :title="`${$t('mode.' + event.mode)} - ${mapName}`"
              :content="aiReport.html"
              @interact="trackInteraction('map-report-fadeout')"
            ></ai-report-2>
          </template>
        </experiment>
      </client-only>
    </template>

    <p
      v-else
      id="description"
      class="prose dark:prose-invert"
    >
      {{ $t('tier-list.map.description', { map: mapName, mode: $t('mode.' + event.mode) }) }}
    </p>

    <ad
      ad-slot="1665534416"
      first
    ></ad>

    <b-lightbox id="lightbox" v-model="lightboxOpen">
      <map-img
        :event-id="event.id"
        :map="event.map"
        clazz="h-full object-contain"
        size=""
      ></map-img>
    </b-lightbox>

    <b-page-section>
      <b-split-dashboard>
        <template
          v-if="showImage"
          v-slot:aside
        >
          <event-picture-card
            id="aside"
            :mode="event.mode"
            :map="event.map"
            :event-id="event.id"
            class="relative"
            @click.capture.prevent="lightboxOpen = true"
          >
            <fa
              :icon="faExpand"
              class="absolute bottom-4 right-6"
            ></fa>
          </event-picture-card>
        </template>

        <map-views
          id="dashboard"
          :mode="event.mode"
          :map="event.map"
          :event-id="event.id"
          ga-category="map"
        ></map-views>
      </b-split-dashboard>
    </b-page-section>

    <ad
      ad-slot="3536131238"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { deslugify, kebabToCamel } from '~/lib/util'
import { BSplitDashboard, BCard, BLightbox, BPage, BPageSection, Fa } from '@schneefux/klicker/components'
import { useMapName } from '~/composables/map'
import { faExpand } from '@fortawesome/free-solid-svg-icons'
import { useApi, useAsync, useCacheHeaders, useConfig, useMeta, useValidate } from '~/composables/compat'
import { useKlicker } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'
import { useRouteParams } from '~/composables/route-params'
import { useTrackScroll } from '~/composables/gtag'

interface Map {
  id: string
  mode: string
  map: string
}

export default defineComponent({
  components: {
    Fa,
    BSplitDashboard,
    BLightbox,
    BCard,
    BPage,
    BPageSection,
  },
  async setup() {
    const $klicker = useKlicker()
    const $config = useConfig()
    const $api = useApi()
    const i18n = useI18n()
    const routeParams = useRouteParams()

    const mode = computed(() => kebabToCamel(routeParams.value!.mode as string))
    const map = computed(() => deslugify(routeParams.value!.map as string))

    const event = useAsync(async () => {
      const events = await $klicker.query({
        cubeId: 'map',
        slices: {
          mode: [mode.value],
          map: [map.value],
        },
        dimensionsIds: [],
        metricsIds: ['eventId'],
        sortId: 'eventId',
        limit: 1,
      })
      const event = events.data[0]

      return {
        id: event.metricsRaw.eventId,
        map: map.value,
        mode: mode.value,
      } as Map
    }, computed(() => `map-${mode.value}-${map.value}`))

    useCacheHeaders()
    useMeta(() => {
      if (event.value == undefined) {
        return {}
      }

      const description = i18n.t('tier-list.map.meta.description', {
        map: i18n.t('map.' + event.value.id),
        mode: i18n.t('mode.' + event.value.mode),
      })
      return {
        title: i18n.t('tier-list.map.meta.title', {
          map: i18n.t('map.' + event.value.id),
        }),
        meta: [
          { hid: 'description', name: 'description', content: description },
          ...(event.value.id != undefined && event.value.id != '0' ? [{ hid: 'og:image', property: 'og:image', content: $config.mediaUrl + '/maps/' + event.value.id + '.png' }] : []),
        ]
      }
    })

    const showImage = computed(() => event.value?.id != undefined && event.value.map != 'Competition Entry')

    const mapName = useMapName(computed(() => event.value?.id), computed(() => event.value?.map))

    const lightboxOpen = ref(false)

    const aiReport = useAsync(() => $api.report.byModeMap.query({
      localeIso: i18n.locale.value,
      mode: mode.value,
      map: map.value,
    }).catch(() => null), computed(() => `ai-report-${i18n.locale.value}-${mode.value}-${map.value}`))

    const { trackInteraction } = useTrackScroll('map')

    await useValidate(async ({ params }) => {
      const mode = kebabToCamel(params.mode as string)
      const map = deslugify(params.map as string)
      if (map.startsWith('Competition')) {
        return true
      }

      const events = await $klicker.query({
        cubeId: 'map',
        slices: {
          mode: [mode],
          map: [map],
        },
        dimensionsIds: [],
        metricsIds: ['eventId'],
        sortId: 'eventId',
        limit: 1,
      })

      return events.data[0].metricsRaw.eventId != '0'
    })

    return {
      event,
      mapName,
      aiReport,
      faExpand,
      showImage,
      lightboxOpen,
      trackInteraction,
    }
  },
})
</script>
