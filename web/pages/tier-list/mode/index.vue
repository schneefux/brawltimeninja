<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">Game Mode Tier Lists</h1>
      <p>
        Mode Tier Lists for all modes in Brawl Stars.
        Click on a Mode and see the best Brawlers for all Brawl Stars Modes.
      </p>
    </div>

    <adsense
      v-if="ads"
      root-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="5576993339"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <div
      class="section"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'modes'),
        once: true,
      }"
    >
      <div class="flex flex-wrap justify-center">
        <nuxt-link
          v-for="mode in modes"
          :key="mode.mode"
          :to="`/tier-list/mode/${camelToKebab(mode)}`"
        >
          <event :mode="mode" actions>
            <template v-slot:content>
              <div class="brawler-avatars my-4">
                <div
                  v-for="brawler in topBrawlersByMode[mode].slice(0, 5)"
                  :key="brawler.id"
                  class="brawler-avatars__element"
                >
                  <div class="brawler-avatar">
                    <media-img
                      :path="`/brawlers/${brawler.id}/avatar`"
                      size="160"
                      clazz="brawler-avatar__img"
                    />
                    <p class="brawler-avatar__stats">
                      {{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}
                      {{ metaStatMaps.labelsShort[brawler.sortProp] }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
            <template v-slot:actions>
              <div class="flex justify-end">
                <nuxt-link
                  :to="`/tier-list/mode/${mode}`"
                  class="button button-md"
                >
                  Open
                </nuxt-link>
              </div>
            </template>
          </event>
        </nuxt-link>
      </div>
    </div>

    <adsense
      v-if="ads && !isApp"
      root-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="6913006175"
      data-ad-format="auto"
      data-full-width-responsive
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { getMostPopular, metaStatMaps, formatMode, camelToKebab } from '../../../lib/util'
import { ModeMetaMap } from '../../../model/MetaEntry'

export default Vue.extend({
  name: 'ModeMetaPage',
  head() {
    const description = 'Brawl Stars Game Mode Tier Lists. Find the best Brawlers. View Win Rates and Rankings.'
    return {
      title: 'All Game Modes Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      modeMeta: {} as ModeMetaMap,
      camelToKebab,
      formatMode,
      metaStatMaps,
    }
  },
  computed: {
    modes() {
      const modeMeta = this.modeMeta as ModeMetaMap
      return [...Object.keys(modeMeta)]
        .sort((mode1, mode2) => modeMeta[mode2].sampleSize - modeMeta[mode1].sampleSize)
    },
    topBrawlersByMode() {
      return getMostPopular((<any>this).modeMeta as ModeMetaMap)
    },
    ...mapState({
      ads: (state: any) => state.adsEnabled as boolean,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ $axios }) {
    const modeMeta = await $axios.$get('/api/meta/mode')
    return {
      modeMeta,
    }
  },
  methods: {
    trackScroll(visible, element, section) {
      if (visible && '$ga' in this) {
        this.$ga.event('modes', 'scroll', section)
      }
    },
  },
})
</script>
