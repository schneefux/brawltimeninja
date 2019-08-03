<template>
  <div class="py-4 px-2">
    <div class="py-8 px-6 my-8 relative">
      <h1 class="text-4xl md:text-center mt-2 font-semibold">
        <span class="capitalize">
          {{ brawlerId }}
        </span>
        Meta
      </h1>
      <!--
      <div class="flex justify-center mt-5">
        (TODO: Brawler-Bild hier)
      </div>
      -->
      <p class="md:text-center">
        The statistics shown are from Battles by Players who visited Brawl Time Ninja in the current season.
        For this reason, the numbers shown can be contrary to your personal experience.
      </p>
      <p class="mt-2 mb-6 md:text-center">
        Showing average statistics for
        <span class="capitalize">{{ brawlerId }}</span>.
      </p>

      <p
        v-if="totalSampleSize < 10000"
        class="my-8 text-center"
      >
        ⚠ Not enough data for this Brawler yet!
        Statistics will be inaccurate.
        Play a few battles and come back later. ⚠
      </p>

      <meta-grid
        :entries="starpowers"
        :enableSort="false"
        :ad-slots="[]"
        :ad-frequency="99999"
        ga-category="starpower_meta"
      />

      <div class="section-heading">
        <h2 class="text-2xl font-semibold">
          Game Modes
        </h2>
      </div>

      <div class="section">
        <div class="flex flex-wrap">
          <div
            v-for="entry in modes"
            :key="entry.mode"
            class="w-full md:w-1/2 card-wrapper mx-auto"
          >
            <div
              class="items-center card bg-center bg-cover h-full"
              :style="'background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(\'' + require(`~/assets/images/mode/background/${modeToBackgroundId(entry.mode)}.jpg`) + '\')'"
            >
              <div class="card-content">
                <span class="card-header">
                  {{ formatMode(entry.mode) }}
                </span>
                <div class="card-props">
                  <table class="w-full">
                    <tr
                      v-for="(_, prop) in entry.stats"
                      :key="prop"
                      class="card-props whitespace-no-wrap"
                    >
                      <td class="card-prop-label">
                        {{ metaStatMaps.labels[prop] }}
                      </td>
                      <td class="card-prop-value text-right pl-1">
                        {{ metaStatMaps.formatters[prop](entry.stats[prop]) }}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { metaStatMaps, formatMode, modeToBackgroundId } from '~/store/index'
import MetaGrid from '~/components/meta-grid'

export default {
  name: 'StarpowerMetaPage',
  components: {
    MetaGrid,
  },
  asyncData({ params }) {
    return {
      brawlerId: params.brawler,
    }
  },
  data() {
    return {
      metaStatMaps,
      formatMode,
      modeToBackgroundId,
    }
  },
  computed: {
    totalSampleSize() {
      return this.starpowerMeta
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    starpowers() {
      return this.starpowerMeta
        .filter(entry => entry.brawlerName === this.brawlerId)
        .slice()
        .map(entry => ({
          id: entry.id,
          title: entry.starpowerName || 'No Starpower',
          brawler: entry.brawlerName,
          stats: entry.stats,
        }))
    },
    modes() {
      // transpose { mode: { brawler} } to { brawler: mode }
      return [...Object.values(this.modeMeta)]
        .map(meta => [...Object.entries(meta.brawlers)]
          .map(([brawlerId, brawler]) => ({
            mode: meta.mode,
            brawlerId,
            ...brawler
          }))
        )
        .reduce((allEntries, modeEntries) => allEntries.concat(...modeEntries), [])
        .filter(({ brawlerId }) => brawlerId === this.brawlerId)
        .sort((m1, m2) => m2.sampleSize - m1.sampleSize)
    },
    ...mapState({
      starpowerMeta: state => state.starpowerMeta,
      modeMeta: state => state.modeMeta,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadStarpowerMeta')
      await store.dispatch('loadModeMeta')
    }
  },
  async created() {
    if (process.static) {
      await this.loadStarpowerMeta()
      await this.loadModeMeta()
    }
  },
  methods: {
    ...mapActions({
      loadStarpowerMeta: 'loadStarpowerMeta',
      loadModeMeta: 'loadModeMeta',
    }),
  },
}
</script>
