<template>
  <page-dashboard
    :title="$t('tier-list.map.title', { map: event.id != 0 ? $t('map.' + event.id) : event.map })"
  >
    <p>{{ $t('tier-list.map.description', { map: event.id != 0 ? $t('map.' + event.id) : event.map, mode: $t('mode.' + event.mode) }) }}</p>
    <p v-if="event.map.startsWith('Competition ')">
      {{ $t('tier-list.competition-info') }}
      <b-button
        to="/tier-list/competition-winners"
        prefetch
        primary
        xs
      >{{ $t('tier-list.compare-competition-winners') }}</b-button>
    </p>

    <map-breadcrumbs
      :mode="event.mode"
      :map="event.map"
      :id="event.id"
    ></map-breadcrumbs>

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

    <page-section>
      <map-best-brawlers-card
        :mode="event.mode"
        class="mx-auto"
        md
        link
      ></map-best-brawlers-card>
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
import { deslugify, kebabToCamel } from '~/lib/util'

interface Map {
  id: string
  mode: string
  map: string
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
      } as Map,
    }
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ params, error, $clicker }) {
    const mode = kebabToCamel(params.mode)
    const map = deslugify(params.map)
    const events = await $clicker.query('all.events', 'map',
      ['battle_event_id', 'battle_event_mode', 'battle_event_map'],
      ['battle_event_id', 'battle_event_mode', 'battle_event_map', 'timestamp'],
      {
        battle_event_mode: [mode],
        battle_event_map: [map],
      },
      { cache: 60*10 })
    if (events.data.length == 0) {
      return error({ statusCode: 404, message: 'Map not found' })
    }
    const event = events.data[0]

    return {
      event: {
        id: event.battle_event_id,
        map,
        mode,
        timestamp: event.timestamp,
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
