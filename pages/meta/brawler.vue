<template>
  <div class="py-4 px-2">
    <div
      :class="{ 'md:bg-grey-lighter md:text-black': !forceMobile }"
      class="py-8 px-6 my-8 relative"
    >
      <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
        Brawler Meta
      </h1>
      <p class="mb-3 text-center">
        Statistics from Pro Battles on Brawl Time Ninja this week.
      </p>

      <p
        v-if="totalSampleSize < 1000"
        class="my-8 text-center"
      >
        Not enough data! Play a few battles and come back later.
      </p>

      <button
        v-show="!forceMobile"
        class="hidden md:block text-sm text-grey-darker mr-3 mt-2 absolute top-0 right-0 underline"
        @click="forceMobile = true; $ga.event('meta', 'view', 'switch_to_cards')"
      >
        Switch to Cards View
      </button>
      <button
        v-show="forceMobile"
        class="hidden md:block mx-auto -mt-2 mb-6 text-sm text-grey-light underline"
        @click="forceMobile = false; $ga.event('meta', 'view', 'switch_to_table')"
      >
        Switch to Table View
      </button>

      <adsense
        v-if="ads"
        ins-class="h-24 mb-2 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9201379700"
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
            v-for="brawler in sortedMeta"
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
        class="text-center flex flex-wrap justify-between"
      >
        <div class="text-center w-full">
          <span class="mr-2">Sort By</span>
          <button
            v-for="(_, prop) in comparators"
            :key="prop"
            class="mr-3 mb-2 bg-secondary border-secondary hover:bg-secondary-light hover:border-secondary-light text-black font-semibold text-sm border-2 rounded py-1 px-2"
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
              ins-class="h-32 md:min-w-80 mx-auto"
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
        data-ad-slot="7838173054"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { induceAdsIntoBrawlers, metaStatMaps } from '~/store/index'
import BrawlerCard from '~/components/brawler-card'

export default {
  name: 'BrawlerMetaPage',
  components: {
    BrawlerCard,
  },
  head() {
    const description = `BrawlStars Brawler Tier List. Find the best Brawlers. View Win Rates, Pick Rates and Rankings.`
    return {
      title: 'Brawler Meta',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      selectedProp: 'trophyChange',
      order: +1,
      forceMobile: true,
      metaStatMaps,
    }
  },
  computed: {
    totalSampleSize() {
      return this.meta
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    sortedMeta() {
      const meta = this.meta.slice()
      return meta.sort(this.comparators[this.selectedProp])
        .map((entry, index) => ({
          ...entry,
          index: index + 1,
        }))
    },
    comparators() {
      const comparators = {}

      if (this.meta.length === 0) {
        return comparators
      }

      // add mode statistics that have values not null
      Object.entries(this.meta[0].stats).forEach(([prop, value]) => {
        if (value !== null && value !== 0) {
          comparators[prop] = (e1, e2) => this.order * (e2.stats[prop] - e1.stats[prop])
        }
      })

      return comparators
    },
    brawlersAndAds() {
      const adSlots = ['5457575815', '2907434096', '3837372386', '6271964031', '9020582159', '9306580664']
      const adFrequency = 7
      const brawlers = this.sortedMeta
      return induceAdsIntoBrawlers(brawlers, adSlots, adFrequency)
    },
    ...mapState({
      meta: state => state.brawlerMeta,
      ads: state => state.adsAllowed,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadBrawlerMeta')
    }
  },
  async mounted() {
    if (process.static) {
      await this.loadBrawlerMeta()
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

      this.$ga.event('brawler_meta', 'sort_by', `${this.selectedProp} ${this.order < 0 ? 'desc' : 'asc'}`)
    },
    ...mapActions({
      loadBrawlerMeta: 'loadBrawlerMeta',
    }),
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
