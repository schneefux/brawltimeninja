<template>
  <div class="container mx-auto p-4">
    <div class="section-heading">
      <h1 class="text-3xl font-semibold">
        Game Mode Tier Lists
      </h1>
    </div>

    <div class="section">
      <div class="flex flex-wrap">
        <event
          v-for="mode in modes"
          :key="mode"
          :mode="mode"
        >
          <template v-slot:content>
            <div class="text-center py-4">
              <nuxt-link :to="`/tier-list/mode/${camelToKebab(mode)}`" class="link bg-black px-2 py-1 rounded-sm">
                Open the {{ formatMode(mode) }} Tier List
              </nuxt-link>
            </div>
          </template>
        </event>
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
import { formatMode, modeToBackgroundId, camelToKebab } from '~/lib/util'
import MetaGrid from '~/components/meta-grid.vue'
import Event from '~/components/event'

export default {
  name: 'ModeMetaPage',
  components: {
    MetaGrid,
    Event,
  },
  head() {
    // TODO
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
      modeToBackgroundId,
    }
  },
  computed: {
    modes() {
      return [...Object.keys(this.modeMeta)]
        .sort((mode1, mode2) => this.modeMeta[mode2].sampleSize - this.modeMeta[mode1].sampleSize)
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
