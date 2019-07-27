<template>
  <div class="py-4 px-2">
    <div
      :class="{ 'md:bg-grey-lighter md:text-black': !forceMobile }"
      class="py-8 px-6 my-8 relative"
    >
      <h1 class="text-4xl md:text-center mt-2 font-semibold">
        Map Meta
      </h1>
      <h2 class="text-2xl md:text-center mt-3 font-semibold capitalize">
        {{ formatMode(selectedMode) }}: {{ selectedMap }}
      </h2>
      <div class="flex justify-center mt-5">
        <event-card :event="selectedEvent" />
      </div>
      <p class="mt-6 md:text-center">
        The statistics shown are from Battles by Players who visited Brawl Time Ninja in the current season.
        For this reason, the numbers shown can be contrary to your personal experience.
      </p>
      <p class="mt-2 mb-6 md:text-center">
        Showing statistics for
        <span class="text-primary-lighter inline-block">
          {{ formatMode(selectedMode) }} - {{ selectedMap }}
        </span>.
        To view average Win Rates for all maps, load the
        <nuxt-link to="/meta/brawler" class="link inline-block">
          Brawler Meta
        </nuxt-link>.
      </p>

      <p
        v-if="meta.sampleSize < 1000"
        class="mt-5 mb-8 text-center text-xl font-bold"
      >
        ⚠ Not enough data for this event yet!
        <template v-if="sortedBrawlers.length == 0">
          Statistics are unavailable.
        </template>
        <template v-else>
          Statistics will be inaccurate.
        </template>
        Play a few battles and come back later. ⚠
      </p>

      <button
        v-show="!forceMobile"
        class="hidden md:block text-sm text-grey-darker mr-3 mt-2 absolute top-0 right-0 underline"
        @click="forceMobile = true; $ga.event('map_meta', 'switch_view', 'cards')"
      >
        Switch to Cards View
      </button>
      <button
        v-show="forceMobile"
        class="hidden md:block mx-auto -mt-2 mb-6 text-sm text-grey-light underline"
        @click="forceMobile = false; $ga.event('map_meta', 'switch_view', 'table')"
      >
        Switch to Table View
      </button>

      <adsense
        v-if="ads"
        ins-class="h-24 mb-2 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1665534416"
      />

      <table
        v-show="!forceMobile"
        class="table hidden md:table mx-auto"
      >
        <thead>
          <tr>
            <th scope="col" class="text-right">
              #
            </th>
            <th scope="col" class="text-left">
              Name
            </th>
            <th
              v-for="(_, prop) in comparators"
              :key="prop"
              scope="col"
              class="text-right whitespace-no-wrap"
            >
              <button
                class="font-bold"
                @click="sortBy(prop)"
              >
                <span v-if="selectedProp === prop">
                  <template v-if="order < 0">▲</template>
                  <template v-else>▼</template>
                </span>
                <span v-else>&nbsp;&nbsp;&nbsp;</span>
                <span class="underline">{{ metaStatMaps.labels[prop] }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="brawler in sortedBrawlers"
            :key="brawler.id"
          >
            <th scope="row" class="text-right">
              {{ brawler.index }}
            </th>
            <td class="font-semibold">
              {{ brawler.name }}
              <img
                class="w-12 mt-1"
                :src="require(`~/assets/images/hero/icon/${brawler.id}_optimized.png`)"
              >
            </td>
            <td
              v-for="(_, prop) in comparators"
              :key="prop"
              class="text-center"
            >
              {{ metaStatMaps.formatters[prop](brawler.stats[prop]) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        :class="{ 'md:hidden': !forceMobile }"
        class="text-center flex flex-wrap justify-between items-center"
      >
        <div class="text-center w-full">
          <span class="mr-2">Sort By</span>
          <button
            v-for="(_, prop) in comparators"
            :key="prop"
            class="mr-3 mb-2 button button-sm"
            @click="sortBy(prop)"
          >
            <span v-if="selectedProp === prop">
              <template v-if="order < 0">▲</template>
              <template v-else>▼</template>
            </span>
            <span>{{ metaStatMaps.labels[prop] }}</span>
          </button>
        </div>

        <template v-for="brawler in brawlersAndAds">
          <div
            v-if="ads || brawler.name !== undefined"
            :key="brawler.id"
            class="card-wrapper w-full md:flex-1"
          >
            <adsense
              v-if="ads && brawler.name === undefined"
              ins-class="md:min-w-80 mx-auto"
              data-ad-client="ca-pub-6856963757796636"
              :data-ad-slot="brawler.id"
            />

            <brawler-card
              v-if="brawler.name !== undefined"
              :id="brawler.id"
              :name="brawler.name"
              class="h-auto"
            >
              <template v-slot:history>
                <div class="mb-auto text-right">
                  <span class="font-semibold text-white text-2xl text-shadow">
                    #{{ brawler.index }}
                  </span>
                </div>
              </template>
              <template v-slot:stats>
                <table>
                  <tr
                    v-for="(_, prop) in comparators"
                    :key="prop"
                    class="card-props whitespace-no-wrap"
                  >
                    <td class="text-center">
                      <img
                        v-if="metaStatMaps.icons[prop].length > 2"
                        :src="require(`~/assets/images/icon/${metaStatMaps.icons[prop]}_optimized.png`)"
                        class="card-prop-icon inline"
                      >
                      <!-- use emojis (length 2) -->
                      <span
                        v-else
                        class="card-prop-icon"
                      >
                        {{ metaStatMaps.icons[prop] }}
                      </span>
                    </td>
                    <td class="card-prop-value text-right pr-1">
                      {{ metaStatMaps.formatters[prop](brawler.stats[prop]) }}
                    </td>
                    <td class="card-prop-label">
                      {{ metaStatMaps.labels[prop] }}
                    </td>
                  </tr>
                </table>
              </template>
            </brawler-card>
          </div>
        </template>
      </div>

      <adsense
        v-if="ads"
        ins-class="h-32 mt-4 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3536131238"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { induceAdsIntoBrawlers, formatMode, metaStatMaps } from '~/store/index'
import BrawlerCard from '~/components/brawler-card.vue'
import EventCard from '~/components/event-card.vue'

export default {
  name: 'MapMetaPage',
  components: {
    BrawlerCard,
    EventCard,
  },
  head() {
    const description = `BrawlStars Game Mode Tier List. Best Brawlers for ${formatMode(this.selectedMode)}: ${this.selectedMap}. View Win Rates, Pick Rates and Rankings.`
    return {
      title: `${formatMode(this.selectedMode)}: ${this.selectedMap}`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      order: +1,
      forceMobile: true,
      formatMode,
      metaStatMaps,
    }
  },
  computed: {
    selectedMode() {
      return this.selectedEvent.mode
    },
    selectedMap() {
      return this.selectedEvent.map
    },
    meta() {
      return this.mapMeta[this.selectedEvent.id]
    },
    sortedBrawlers() {
      const meta = [...Object.entries(this.meta.brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          ...brawler,
        }))
      if (meta.length < this.totalBrawlers) {
        return []
      }

      return meta.sort(this.comparators[this.selectedProp])
        .map((entry, index) => ({
          ...entry,
          index: index + 1,
        }))
    },
    brawlersAndAds() {
      const adSlots = ['3154710057', '6902383379', '8405314532', '7640749978', '1075341622', '5745639405']
      const adFrequency = 7
      const brawlers = this.sortedBrawlers
      return induceAdsIntoBrawlers(brawlers, adSlots, adFrequency)
    },
    comparators() {
      return [...Object.keys(this.meta.brawlers.crow.stats)]
        .reduce((comparators, prop) => ({
          ...comparators,
          [prop]: (e1, e2) => this.order * (e2.stats[prop] - e1.stats[prop])
        }), {})
    },
    ...mapState({
      totalBrawlers: state => state.totalBrawlers,
      mapMeta: state => state.mapMeta,
      ads: state => state.adsEnabled,
    }),
  },
  async validate({ store, params }) {
    await store.dispatch('loadMapMetaSlice', `include=${params.event}`)
    return params.event in store.state.mapMeta
  },
  asyncData({ store, params }) {
    const meta = store.state.mapMeta[params.event]
    const selectedProp = metaStatMaps.propPriority.find(prop => prop in meta.brawlers.crow.stats)
    return {
      selectedProp,
      selectedEvent: {
        id: params.event,
        mode: meta.mode,
        map: meta.map,
      }
    }
  },
  methods: {
    sortBy(prop) {
      if (this.selectedProp === prop) {
        this.order *= -1
      } else {
        this.selectedProp = prop
        this.order = +1
      }

      this.$ga.event('map_meta', 'sort_by', `${this.selectedProp} ${this.order < 0 ? 'desc' : 'asc'}`)
    },
  },
}
</script>

<style scoped>
.table th {
  @apply py-2 px-2;
}

.table td {
  @apply py-4 px-2;
}

.table tbody td, tbody th {
  @apply border-t border-grey-light;
}
</style>
