<template>
  <page-dashboard
    :title="$t('tier-list.mode.title', { mode: $t('mode.' + mode) })"
  >
    <breadcrumbs
      :links="[{
        path: '/tier-list/map',
        name: $tc('map', 2),
      }, {
        path: modePath,
        name: $t('mode.' + mode),
      }]"
      class="mt-4"
    ></breadcrumbs>

    <p class="mt-4 prose prose-invert">
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
      <p
        slot="description"
        class="mt-4 prose prose-invert"
      >
        {{ $t('tier-list.open-map') }}
      </p>

      <form
        class="mt-4"
        @submit.prevent="$fetch()"
      >
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

      <scrolling-dashboard
        :length="maps.length"
        page-size="4"
        class="mt-8"
      >
        <template v-slot="{ limit }">
          <lazy
            v-for="(map, index) in maps"
            :key="map.map"
            :render="index <= 4"
            distance="600px"
            :class="{
              'lg:hidden': index >= limit,
            }"
            class="dashboard__cell"
            style="--rows: 3; --columns: 2;"
          >
            <div slot="placeholder"></div>
            <event-card
              :mode="mode"
              :map="map.map"
              :link="mapPath(map)"
              :id="map.id"
              nobackground
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
            </event-card>
          </lazy>
        </template>
      </scrolling-dashboard>
    </page-section>

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
})
</script>
