<template>
  <div class="container mx-auto p-4">
    <div class="section-heading">
      <h1 class="text-3xl font-semibold">
        Game Mode Tier Lists
      </h1>
    </div>

    <div class="section">
      <div class="flex flex-wrap justify-center">
        <nuxt-link
          v-for="mode in modes"
          :key="mode"
          :to="`/tier-list/mode/${camelToKebab(mode)}`"
        >
          <event :mode="mode">
            <template v-slot:content>
              <div class="brawler-avatars mt-3 mb-2">
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
              <div class="text-center py-4">
                <span class="link bg-black px-3 py-2 rounded-sm">
                  Open the {{ formatMode(mode) }} Tier List
                </span>
              </div>
            </template>
          </event>
        </nuxt-link>
      </div>
    </div>

    <p class="md:text-center px-2 mt-4 mb-2 max-w-lg mx-auto">
      Mode Tier Lists for all modes in Brawl Stars.
      Click on a Mode and see the best Brawlers for all Brawl Stars Modes.
      The data is from battles played in the current season.
    </p>
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
