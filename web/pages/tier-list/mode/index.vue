<template>
  <div class="page container">
    <div class="section-heading">
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

    <div class="section">
      <div class="flex flex-wrap justify-center">
        <nuxt-link
          v-for="mode in modes"
          :key="mode"
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

<script>
import { mapState, mapActions } from 'vuex'
import { formatMode, camelToKebab } from '~/lib/util'
import { metaStatMaps } from '~/lib/util'
import { getMostPopular } from '../../../lib/util'

export default {
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
      camelToKebab,
      formatMode,
      metaStatMaps,
    }
  },
  computed: {
    modes() {
      return [...Object.keys(this.modeMeta)]
        .sort((mode1, mode2) => this.modeMeta[mode2].sampleSize - this.modeMeta[mode1].sampleSize)
    },
    topBrawlersByMode() {
      return getMostPopular(this.modeMeta)
    },
    ...mapState({
      modeMeta: state => state.modeMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadModeMeta')
    }
  },
  async created() {
    if (process.static) {
      await this.loadModeMeta()
    }
  },
  methods: {
    ...mapActions({
      loadModeMeta: 'loadModeMeta',
    }),
  },
}
</script>
