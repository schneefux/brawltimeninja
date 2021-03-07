<template>
  <page :title="$t('tier-list.mode.title', { mode: $t('mode.' + mode) })">
    <p>{{ $t('tier-list.mode.description', { mode: $t('mode.' + mode) }) }}</p>

    <map-breadcrumbs
      :mode="mode"
    ></map-breadcrumbs>

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
      title="Map Tier Lists"
      tracking-id="maps"
      tracking-page-id="mode_meta"
    >
      <p slot="description">{{ $t('tier-list.open-map') }}</p>

      <horizontal-scroller expand-on-desktop>
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
            nobackground
            :class="['mx-2', {
              'md:hidden': !showAllMaps && index > 3,
            }]"
            size="w-64"
          >
            <template v-slot:content>
              <media-img
                v-if="map.id != 0"
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
              :to="`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map.map)}`"
              primary
              sm
            >
              {{ $t('action.open') }}
            </b-button>
          </event-card>
        </lazy>
      </horizontal-scroller>

      <div
        v-show="!showAllMaps"
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
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { kebabToCamel } from '~/lib/util'
import { camelToKebab, slugify } from '@/lib/util'
import Page from '~/components/page.vue'

interface EventIdAndMap {
  id: number
  map: string
}

export default Vue.extend({
  components: {
    Page,
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
    }
  },
  async asyncData({ params, $clicker }) {
    const mode = kebabToCamel(params.mode as string)
    const events = await $clicker.query('all.events', 'map',
      ['battle_event_id', 'battle_event_map'],
      ['battle_event_id', 'battle_event_map', 'picks', 'timestamp'],
      { battle_event_mode: [mode] },
      {
        sort: { timestamp: 'desc' },
        cache: 60*60,
      })

    return {
      mode,
      maps: events.data
        .filter(e => e.picks > 1000)
        .map(e => ({
          id: e.battle_event_id,
          map: e.battle_event_map,
          timestamp: e.timestamp,
        })),
    }
  },
  computed: {
    camelToKebab() {
      return camelToKebab
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
