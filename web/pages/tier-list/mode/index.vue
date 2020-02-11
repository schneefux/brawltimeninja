<template>
  <div class="py-4 px-6">
    <h1 class="text-3xl md:text-center mt-2 mb-6 font-semibold">
      Game Mode Tier Lists
    </h1>

    <div class="section">
      <div class="flex flex-wrap">
        <div
          v-for="mode in modes"
          :key="mode"
          class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 card-wrapper mx-auto z-10"
        >
          <div
            class="items-center card bg-center bg-cover h-full"
            :style="'background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(\'' + require(`~/assets/images/mode/background/${modeToBackgroundId(mode)}.jpg`) + '\')'"
          >
            <div class="card-content">
              <span class="card-header">
                {{ formatMode(mode) }}
              </span>
              <div class="card-props">
                <nuxt-link :to="`/tier-list/mode/${camelToKebab(mode)}`" class="link">
                  View {{ formatMode(mode) }} Tier List
                </nuxt-link>
              </div>
            </div>
          </div>
        </div>
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

export default {
  name: 'ModeMetaPage',
  components: {
    MetaGrid,
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
