<template>
  <page-dashboard
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
      <p class="prose prose-invert">
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

      <media-img
        v-if="showImage"
        :path="`/maps/${event.id}`"
        :alt="title"
        size="256"
        clazz="h-64 mt-6 md:mt-0"
      ></media-img>
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
  </page-dashboard>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { camelToKebab, deslugify, kebabToCamel, slugify } from '~/lib/util'

interface Map {
  id: string
  mode: string
  map: string
  timestamp: string|undefined
}

export default Vue.extend({
  head(): MetaInfo {
    const description = this.$tc('tier-list.map.meta.description', 1, {
      map: this.$i18n.t('map.' + this.event.id),
      mode: this.$i18n.t('mode.' + this.event.mode),
    })
    return {
      title: this.$tc('tier-list.map.meta.title', 1, {
        map: this.$i18n.t('map.' + this.event.id),
      }),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
        ...(this.event.id != undefined && this.event.id != '0' ? [{ hid: 'og:image', property: 'og:image', content: this.$config.mediaUrl + '/maps/' + this.event.id + '.png' }] : []),
      ]
    }
  },
  meta: {
    screen: 'events',
  },
  middleware: ['cached'],
  data() {
    return {
      event: {
        id: '',
        mode: '',
        map: '',
        timestamp: undefined,
      } as Map,
    }
  },
  computed: {
    title(): string {
      return this.event.id == '0' ? this.$tc('competition-winner', 1) as string : this.$t('map.' + this.event.id) as string
    },
    image(): string {
      return this.event.id == '0' ? `/maps/competition-winners/${this.event.map.replace('Competition Winner ', '')}` : `/maps/${this.event.id}`
    },
    showImage(): boolean {
      return this.event.id != undefined && this.event.map != 'Competition Entry'
    },
    modePath(): string {
      return `/tier-list/mode/${camelToKebab(this.event.mode)}`
    },
    mapPath(): string {
      return `${this.modePath}/map/${slugify(this.event.map)}`
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ params, error, $klicker }) {
    const mode = kebabToCamel(params.mode)
    const map = deslugify(params.map)
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
    if (events.data.length == 0) {
      return error({ statusCode: 404, message: 'Map not found' })
    }
    const event = events.data[0]

    return {
      event: {
        id: event.metricsRaw.eventId,
        map,
        mode,
        timestamp: event.metricsRaw.timestamp,
      } as Map,
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'map_meta',
          'event_label': section,
        })
      }
    },
  },
})
</script>
