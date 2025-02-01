<template>
  <split-page :title="$t('tier-list.map.title', { map: mapName })">
    <template v-slot:aside-left>
      <b-shimmer
        v-if="event == undefined"
        height-px="40"
        class="my-4"
        loading
      ></b-shimmer>
      <mode-map-jumper
        v-else
        id="mode-map-jumper"
        :mode="event.mode"
        :map="event.map"
        :event-id="event.id"
      ></mode-map-jumper>

      <template v-if="showImage">
        <b-lightbox
          v-if="event != undefined"
          id="lightbox"
          v-model="lightboxOpen"
        >
          <map-img
            :event-id="event.id"
            :map="event.map"
            clazz="h-full object-contain"
            size=""
          ></map-img>
        </b-lightbox>

        <b-shimmer
          v-if="event == undefined"
          height-px="310"
          loading
        ></b-shimmer>
        <event-picture-card
          v-else
          id="aside"
          :mode="event.mode"
          :map="event.map"
          :event-id="event.id"
          class="relative max-w-sm"
          @click.capture.prevent="lightboxOpen = true"
        >
          <fa
            :icon="faExpand"
            class="absolute bottom-4 right-6"
          ></fa>
        </event-picture-card>
      </template>
    </template>

    <b-page-section>
      <b-shimmer
        v-if="event == undefined"
        height-px="56"
        loading
      ></b-shimmer>
      <p
        v-else
        id="description"
        class="prose dark:prose-invert"
      >
        {{ $t('tier-list.map.description', { map: mapName, mode: $t('mode.' + event.mode) }) }}
      </p>
    </b-page-section>

    <ad instream></ad>

    <b-page-section>
      <map-views
        v-if="event != undefined"
        id="dashboard"
        :mode="event.mode"
        :map="event.map"
        :event-id="event.id"
        ga-category="map"
      ></map-views>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { deslugify, kebabToCamel } from '~/lib/util'
import { BShimmer, BLightbox, BPageSection, Fa } from '@schneefux/klicker/components'
import { useMapName } from '~/composables/map'
import { faExpand } from '@fortawesome/free-solid-svg-icons'
import { useCacheHeaders, useConfig, useMeta, useServerBlockingAsync } from '~/composables/compat'
import { useKlicker } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'
import { useRouteParams } from '~/composables/route-params'
import { useTrackScroll } from '~/composables/gtag'
import { getMapName } from '~/composables/map'

interface Map {
  id: string
  mode: string
  map: string
}

export default defineComponent({
  components: {
    Fa,
    BShimmer,
    BLightbox,
    BPageSection,
  },
  async setup() {
    const $klicker = useKlicker()
    const $config = useConfig()
    const i18n = useI18n()
    const routeParams = useRouteParams()
    const { trackInteraction } = useTrackScroll('map')

    useCacheHeaders()

    const showImage = computed(() => event.value?.id != undefined && event.value.map != 'Competition Entry')

    const mapName = useMapName(computed(() => event.value?.id), computed(() => routeParams.value?.map as string))

    const lightboxOpen = ref(false)

    const event = await useServerBlockingAsync<Map>(async ({ params }) => {
      const mode = kebabToCamel(params.mode as string)
      const map = deslugify(params.map as string)

      if (map.startsWith('Competition')) {
        return {
          id: '0',
          map,
          mode,
        }
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

      if (events.data[0].metricsRaw.eventId == '0') {
        return undefined
      }

      return {
        id: events.data[0].metricsRaw.eventId as string,
        map,
        mode,
      }
    }, computed(() => `event-${routeParams.value?.mode}-${routeParams.value?.map}`))

    useMeta(() => {
      if (event.value == undefined) {
        return {}
      }

      const map = getMapName(i18n, event.value.id, event.value.map)
      const description = i18n.t('tier-list.map.meta.description', {
        map,
        mode: i18n.t('mode.' + event.value.mode),
      })
      return {
        title: i18n.t('tier-list.map.meta.title', { map }),
        meta: [
          { hid: 'description', name: 'description', content: description },
          ...(event.value.id != undefined && event.value.id != '0' ? [{ hid: 'og:image', property: 'og:image', content: $config.mediaUrl + '/maps/' + event.value.id + '.png' }] : []),
        ]
      }
    })

    return {
      event,
      mapName,
      faExpand,
      showImage,
      lightboxOpen,
      trackInteraction,
    }
  },
})
</script>
