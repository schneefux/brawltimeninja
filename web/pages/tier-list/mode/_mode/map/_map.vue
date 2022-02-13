<template>
  <page
    v-if="event != undefined"
    :title="$t('tier-list.map.title', { map: title })"
  >
    <breadcrumbs
      :links="[{
        path: '/tier-list/map',
        name: $tc('map', 2),
      }, {
        path: modePath,
        name: $t('mode.' + event.mode),
      }, {
        path: mapPath,
        name: event.id != '0' ? $t('map.' + event.id) : event.map,
      }]"
      class="mt-4"
    ></breadcrumbs>

    <div class="mt-4 flex flex-wrap justify-center md:justify-between">
      <div>
        <p class="prose dark:prose-invert">
          {{ $t('tier-list.map.description', { map: title, mode: $t('mode.' + event.mode) }) }}
        </p>
        <p v-if="event.map.startsWith('Competition ')">
          {{ $t('tier-list.competition-info') }}
          <b-button
            to="/tier-list/competition-winners"
            prefetch
            primary
            xs
          >{{ $t('tier-list.compare-competition-winners') }}</b-button>
        </p>
      </div>

      <map-img
        v-if="showImage"
        :id="event.id"
        :map="event.map"
        clazz="h-64 mt-6 md:mt-0"
      ></map-img>
    </div>

    <client-only>
      <adsense
        ins-class="ad-section"
        id="ezoic-pub-ad-placeholder-112"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1665534416"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <page-section>
      <map-views
        :mode="event.mode"
        :map="event.map"
        :id="event.id"
        :timestamp="event.timestamp"
        ga-category="map"
      ></map-views>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3536131238"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import { defineComponent, useContext, useMeta, computed, useStore, useAsync, useRoute } from '@nuxtjs/composition-api'
import { camelToKebab, deslugify, kebabToCamel, slugify } from '~/lib/util'

interface Map {
  id: string
  mode: string
  map: string
  timestamp: string|undefined
}

export default defineComponent({
  head: {},
  setup() {
    const { i18n, $config, $klicker } = useContext()

    const route = useRoute()
    const event = useAsync(async () => {
      const mode = kebabToCamel(route.value.params.mode)
      const map = deslugify(route.value.params.map)
      const events = await $klicker.query({
        cubeId: 'map',
        slices: {
          mode: [mode],
          map: [map],
        },
        dimensionsIds: [],
        metricsIds: ['eventId', 'timestamp'],
        sortId: 'timestamp',
        limit: 1,
      })
      const event = events.data[0]

      return {
        id: event.metricsRaw.eventId,
        map,
        mode,
        timestamp: event.metricsRaw.timestamp,
      } as Map
    }, 'map')

    useMeta(() => {
      if (event.value == undefined) {
        return {}
      }

      const description = i18n.tc('tier-list.map.meta.description', 1, {
        map: i18n.t('map.' + event.value.id),
        mode: i18n.t('mode.' + event.value.mode),
      })
      return {
        title: i18n.tc('tier-list.map.meta.title', 1, {
          map: i18n.t('map.' + event.value.id),
        }),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
          ...(event.value.id != undefined && event.value.id != '0' ? [{ hid: 'og:image', property: 'og:image', content: $config.mediaUrl + '/maps/' + event.value.id + '.png' }] : []),
        ]
      }
    })

    const title = computed(() => event.value == undefined ? '' : (event.value.id == '0' ? i18n.tc('competition-winner', 1) as string : i18n.t('map.' + event.value.id) as string))
    const showImage = computed(() => event.value?.id != undefined && event.value.map != 'Competition Entry')
    const modePath = computed(() => event.value == undefined ? '' : `/tier-list/mode/${camelToKebab(event.value.mode)}`)
    const mapPath = computed(() => event.value == undefined ? '' : `${modePath.value}/map/${slugify(event.value.map)}`)

    const store = useStore<any>()
    const isApp = computed(() => store.state.isApp as boolean)

    return {
      event,
      title,
      showImage,
      modePath,
      mapPath,
      isApp,
    }
  },
  meta: {
    screen: 'events',
  },
  middleware: ['cached'],
  async validate({ params, $klicker }) {
    const mode = kebabToCamel(params.mode)
    const map = deslugify(params.map)
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
  },
})
</script>
