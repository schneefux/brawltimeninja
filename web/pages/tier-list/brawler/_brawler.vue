<template>
  <div class="py-8 px-6 relative">
    <h1 class="text-4xl md:text-center mt-2 font-semibold">
      {{ brawlerName }} Statistics
    </h1>
    <p class="mt-2 md:text-center">
      This Star Power and Gadget Tier List is generated automatically.
      The data is from Brawl Stars battles played with <span class="text-primary-lighter">{{ brawlerName }}</span> in the current season.
    </p>
    <p class="mt-2 mb-6 md:text-center">
      Showing Star Power and Gadget Tier list and best modes for
      <span class="inline-block text-primary-lighter">
        {{ brawlerName }}
      </span>.
    </p>

    <p
      v-if="totalSampleSize < 10000"
      class="my-8 text-center"
    >
      ⚠ Not enough data for this Brawler yet!
      Statistics will be inaccurate.
      Play a few battles and come back later. ⚠
    </p>

    <div class="section-heading">
      <h2 class="text-2xl font-semibold">
        Star Power Tier List
      </h2>
    </div>

    <media-img
      :path="'/brawlers/' + brawlerId + '/model'"
      clazz="absolute w-1/3 md:w-1/6 mr-2 md:mr-10 right-0 z-0 opacity-25"
    ></media-img>

    <div class="section flex flex-wrap justify-center">
      <template v-for="prop in ['winRate']">
        <template v-for="entry in starpowers">
          <div
            :key="prop + ' ' + entry.id"
            class="card-wrapper px-2"
          >
            <div class="card prop-card prop-card-md w-48">
              <span class="prop-card-title">
                {{ entry.starpowerName || 'No Starpower' }}
              </span>
              <span
                v-if="entry.sampleSize < 1000"
                class="text-xs absolute bottom-0 right-0 text-grey"
              >
                Not enough data yet!
              </span>
              <media-img
                v-if="entry.starpowerName !== ''"
                :path="'/starpowers/' + entry.id"
                size="96"
                clazz="prop-card-image"
              ></media-img>
              <media-img
                v-else
                :path="'/brawlers/' + brawlerId + '/avatar'"
                size="96"
                clazz="prop-card-image"
              ></media-img>
              <div class="prop-card-content prop-card-content-md">
                <div>
                  <span class="card-prop-icon">
                    {{ metaStatMaps.icons[prop] }}
                  </span>
                  <span class="card-prop-value">
                    {{ metaStatMaps.formatters[prop](entry.stats[prop]) }}
                  </span>
                </div>
                <span class="text-sm">
                  {{ metaStatMaps.labels[prop] }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <div class="section-heading">
      <h2 class="text-2xl font-semibold">
        Gadget Tier List
      </h2>
    </div>

    <div class="section flex flex-wrap justify-center">
      <template v-for="prop in ['winRate']">
        <template v-for="entry in gadgets">
          <div
            :key="prop + ' ' + entry.id"
            class="card-wrapper px-2"
          >
            <div class="card prop-card prop-card-md w-48">
              <span class="prop-card-title">
                {{ entry.gadgetName || 'No Gadget' }}
              </span>
              <span
                v-if="entry.sampleSize < 1000"
                class="text-xs absolute bottom-0 right-0 text-grey"
              >
                Not enough data yet!
              </span>
              <media-img
                v-if="entry.gadgetName !== ''"
                :path="'/gadgets/' + entry.id"
                size="96"
                clazz="prop-card-image"
              ></media-img>
              <media-img
                v-else
                :path="'/brawlers/' + brawlerId + '/avatar'"
                size="96"
                clazz="prop-card-image"
              ></media-img>
              <div class="prop-card-content prop-card-content-md">
                <div>
                  <span class="card-prop-icon">
                    {{ metaStatMaps.icons[prop] }}
                  </span>
                  <span class="card-prop-value">
                    {{ metaStatMaps.formatters[prop](entry.stats[prop]) }}
                  </span>
                </div>
                <span class="text-sm">
                  {{ metaStatMaps.labels[prop] }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <adsense
      v-if="ads"
      id="ezoic-pub-ad-placeholder-108"
      root-class="w-full md:w-1/2 mt-4 mx-auto"
      ins-class="mx-4 h-24"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="8533352178"
    />

    <div class="section-heading">
      <h2 class="text-2xl font-semibold">
        Game Mode Statistics
      </h2>
    </div>

    <div class="section">
      <div class="flex flex-wrap">
        <div
          v-for="entry in modes"
          :key="entry.mode"
          class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 card-wrapper mx-auto z-10"
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

    <adsense
      v-if="ads && !isApp"
      id="ezoic-pub-ad-placeholder-109"
      root-class="w-full mt-6 mx-auto"
      ins-class="h-32"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="6837127123"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { metaStatMaps, formatMode, modeToBackgroundId, capitalizeWords } from '~/lib/util'
import MediaImg from '~/components/media-img'

export default {
  name: 'StarpowerMetaPage',
  head() {
    const description = `${this.brawlerName} Brawl Stars stats. Star Power Tier List and Gadget Tier List with win rate and pick rates for all modes.`
    return {
      title: `${this.brawlerName} Star Power and Gadget Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  components: {
    MediaImg,
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
        .sort((e1, e2) => e2.sampleSize - e1.sampleSize)
    },
    gadgets() {
      return this.gadgetMeta
        .filter(entry => entry.brawlerName === this.brawlerId)
        .sort((e1, e2) => e2.sampleSize - e1.sampleSize)
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
      gadgetMeta: state => state.gadgetMeta,
      modeMeta: state => state.modeMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  asyncData({ params }) {
    const brawlerId = params.brawler
    return {
      brawlerId,
      brawlerName: capitalizeWords(brawlerId.replace(/_/g, ' ')),
    }
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadStarpowerMeta')
      await store.dispatch('loadGadgetMeta')
      await store.dispatch('loadModeMeta')
    }
  },
  async created() {
    if (process.static) {
      await this.loadStarpowerMeta()
      await this.loadGadgetMeta()
      await this.loadModeMeta()
    }
  },
  methods: {
    ...mapActions({
      loadStarpowerMeta: 'loadStarpowerMeta',
      loadGadgetMeta: 'loadGadgetMeta',
      loadModeMeta: 'loadModeMeta',
    }),
  },
}
</script>
