<template>
  <page-dashboard
    :title="$t('tier-list.mode.title', { mode: $t('mode.' + mode) })"
  >
    <template slot="content">
      <breadcrumbs
        :links="[{
          path: '/tier-list/map',
          name: $tc('map', 2),
        }, {
          path: modePath,
          name: $t('mode.' + mode),
        }]"
      ></breadcrumbs>

      <p class="mt-2">
        {{ $t('tier-list.mode.description', { mode: $t('mode.' + mode) }) }}
      </p>

      <client-only>
        <adsense
          ins-class="ad-section"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="2291234880"
          data-ad-format="auto"
          data-full-width-responsive="yes"
        />
      </client-only>

      <page-section
        :title="$t('tier-list.maps.title')"
        tracking-id="maps"
        tracking-page-id="mode_meta"
      >
        <p slot="description">{{ $t('tier-list.open-map') }}</p>

        <form @submit.prevent="$fetch()">
          <b-textbox
            v-model="nameFilter"
            :placeholder="$tc('map', 1)"
            dark
          ></b-textbox>
          <b-button
            type="submit"
            primary
            sm
          >{{ $t('action.search') }}</b-button>
        </form>

        <b-horizontal-scroller
          class="mt-3"
          expand-on-desktop
        >
          <lazy
            v-for="(map, index) in maps"
            :key="map.map"
            :render="showAllMaps || index <= 3"
            distance="600px"
          >
            <div
              class="w-64"
              style="height: 396px"
              slot="placeholder"
              :class="['mx-2', {
                'md:hidden': !showAllMaps && index > 3,
              }]"
            ></div>
            <event-card
              :mode="mode"
              :map="map.map"
              :id="map.id"
              :class="['mx-2', {
                'md:hidden': !showAllMaps && index > 3,
              }]"
              nobackground
              size="w-64"
            >
              <template v-slot:preview></template>
              <template v-slot:content>
                <media-img
                  v-if="map.id != '0'"
                  :path="`/maps/${map.id}`"
                  size="512"
                  clazz="mx-auto h-64"
                ></media-img>
                <div
                  v-else
                  class="h-64 flex"
                >
                  <p class="m-auto">{{ $t('state.no-image') }}.</p>
                </div>
              </template>
              <b-button
                slot="actions"
                tag="router-link"
                :to="mapPath(map)"
                primary
                sm
              >
                {{ $t('action.open') }}
              </b-button>
            </event-card>
          </lazy>
        </b-horizontal-scroller>

        <div
          v-show="!showAllMaps && maps.length > 3"
          class="mt-2 w-full text-right hidden md:block"
        >
          <b-button
            sm
            primary
            @click="expandMaps()"
          >
            {{ $t('action.show-all.mode-maps', { mode: $t('mode.' + mode) }) }}
          </b-button>
        </div>
      </page-section>
    </template>

    <template slot="dashboard">
      <client-only>
        <adsense
          v-if="!isApp"
          ins-class="ad-section"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="2263314723"
          data-ad-format="auto"
          data-full-width-responsive="yes"
        />
      </client-only>

      <page-section>
        <map-views
          :mode="mode"
          ga-category="mode"
        ></map-views>
      </page-section>

      <client-only>
        <adsense
          v-if="!isApp"
          ins-class="ad-section"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="8497550588"
          data-ad-format="auto"
          data-full-width-responsive="yes"
        />
      </client-only>
    </template>
  </page-dashboard>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { kebabToCamel } from '~/lib/util'
import { camelToKebab, slugify } from '@/lib/util'
import Page from '~/components/page.vue'
import { BTextbox, BHorizontalScroller } from '@schneefux/klicker/components'

interface EventIdAndMap {
  id: string
  map: string
  timestamp: string
}

export default Vue.extend({
  components: {
    Page,
    BTextbox,
    BHorizontalScroller,
  },
  head(): MetaInfo {
    const description = this.$tc('tier-list.mode.meta.description', 1, { mode: this.$i18n.t('mode.' + this.mode) as string })
    return {
      title: this.$tc('tier-list.mode.meta.title', 1, { mode: this.$i18n.t('mode.' + this.mode) as string }),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    screen: 'events',
  },
  middleware: ['cached'],
  data() {
    return {
      showAllMaps: false,
      mode: '',
      maps: [] as EventIdAndMap[],
      nameFilter: '',
    }
  },
  watch: {
    mode: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    if (this.mode == '') {
      return
    }

    const events = await this.$klicker.query({
      cubeId: 'map',
      slices: {
        mode: [this.mode],
        mapLike: [this.nameFilter],
      },
      dimensionsIds: ['map'],
      metricsIds: ['eventId', 'picks', 'timestamp'],
      sortId: 'timestamp',
    })

    this.maps = events.data
      .filter(e => e.metricsRaw.picks > 1000)
      .map(e => ({
        map: e.dimensionsRaw.map.map,
        id: e.metricsRaw.eventId as string,
        timestamp: e.metricsRaw.timestamp as string,
      }))
  },
  async asyncData({ params }) {
    const mode = kebabToCamel(params.mode as string)

    return {
      mode,
    }
  },
  computed: {
    modePath(): string {
      return `/tier-list/mode/${camelToKebab(this.mode)}`
    },
    mapPath(): (entry: { map: string }) => string {
      return entry => `${this.modePath}/map/${slugify(entry.map)}`
    },
    slugify() {
      return slugify
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  methods: {
    expandMaps() {
      this.showAllMaps = true
      this.$gtag.event('load_more', {
        'event_category': 'meta_mode',
      })
    },
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'mode_meta',
          'event_label': section,
        })
      }
    },
  },
})
</script>
