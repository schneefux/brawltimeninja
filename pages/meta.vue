<template>
  <div class="mx-auto py-4 px-2">
    <div
      :class="{ 'md:bg-grey-lighter': !forceMobile, 'md:text-black': !forceMobile }"
      class="py-8 px-6 my-8 relative"
    >
      <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
        Meta
      </h1>
      <p class="mb-3 text-center">
        Average Trophy statistics from Pros on Brawl Time Ninja this week.
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
        root-class="hidden md:block"
        ins-class="h-24 mb-2"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9201379700"
      />

      <table
        v-show="!forceMobile"
        class="table hidden md:block"
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
              v-for="(label, id) in metaStatMaps.labels"
              :key="id"
              scope="col"
              class="text-right whitespace-no-wrap"
            >
              <button
                class="font-bold"
                @click="sortBy(id)"
              >
                <span v-if="comparator === id">
                  <template v-if="order < 0">▲</template>
                  <template v-else>▼</template>
                </span>
                <span v-else>&nbsp;&nbsp;&nbsp;</span>
                <span class="underline">{{ metaStatMaps.labels[id] }}</span>
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
              {{ brawler.rank }}
            </th>
            <td class="font-semibold">
              {{ brawler.name }}
              <img
                class="w-12 mt-1"
                :src="require(`~/assets/images/hero/icon/${brawler.id}_optimized.png`)"
              >
            </td>
            <td
              v-for="(label, prop) in metaStatMaps.labels"
              :key="prop"
              class="text-center"
            >
              {{ metaStatMaps.formatters[prop](brawler[prop]) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        :class="{ 'md:hidden': !forceMobile }"
        class="flex flex-wrap justify-between"
      >
        <div class="text-center w-full">
          <button
            v-for="(label, id) in metaStatMaps.labels"
            :key="id"
            class="mr-3 mb-2 bg-secondary border-secondary hover:bg-secondary-light hover:border-secondary-light text-black font-semibold text-sm border-2 rounded py-1 px-2"
            @click="sortBy(id)"
          >
            <span v-if="comparator === id">
              <template v-if="order < 0">▲</template>
              <template v-else>▼</template>
            </span>
            <span>{{ metaStatMaps.labels[id] }}</span>
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
              root-class=""
              ins-class="h-32 md:min-w-80 mx-auto"
              data-ad-client="ca-pub-6856963757796636"
              :data-ad-slot="brawler.id"
            />

            <brawler-card
              v-if="brawler.name !== undefined"
              :id="brawler.id"
              :name="brawler.name"
            >
              <template v-slot:history>
                <div class="h-12 text-right">
                  <span class="font-semibold text-white text-2xl text-shadow">
                    #{{ brawler.rank }}
                  </span>
                </div>
              </template>
              <template v-slot:stats>
                <table>
                  <tr
                    v-for="(label, prop) in metaStatMaps.labels"
                    :key="prop"
                    class="card-props whitespace-no-wrap"
                  >
                    <td class="text-center">
                      <img
                        :src="require(`~/assets/images/icon/${metaStatMaps.icons[prop]}_optimized.png`)"
                        class="card-prop-icon"
                      >
                    </td>
                    <td class="card-prop-value text-right pr-1">
                      {{ metaStatMaps.formatters[prop](brawler[prop]) }}
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
        root-class="hidden md:block"
        ins-class="h-32 mt-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="7838173054"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { induceAdsIntoBrawlers } from '~/store/index'
import BrawlerCard from '~/components/brawler-card'

export default {
  name: 'MetaPage',
  components: {
    BrawlerCard,
  },
  head() {
    return {
      title: 'Meta',
    }
  },
  data() {
    const compareProp = (prop) => {
      return (e1, e2) => this.order * (e2[prop] - e1[prop])
    }
    const comparators = {
      trophies: compareProp('trophies'),
      spTrophies: compareProp('spTrophies'),
      trophyChange: compareProp('trophyChange'),
    }

    return {
      ads: true,
      comparator: 'trophies',
      order: +1,
      forceMobile: false,
      comparators,
    }
  },
  computed: {
    sortedMeta() {
      const meta = this.meta.slice()
      return meta.sort(this.comparators[this.comparator])
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))
    },
    brawlersAndAds() {
      const adSlots = ['5457575815', '2907434096', '3837372386', '6271964031', '9020582159', '9306580664']
      const adFrequency = 7
      const brawlers = this.sortedMeta
      return induceAdsIntoBrawlers(brawlers, adSlots, adFrequency)
    },
    ...mapState({
      meta: state => state.meta,
    }),
    ...mapGetters({
      metaStatMaps: 'metaStatMaps',
    })
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadMeta')
    }
  },
  mounted() {
    if (process.static) {
      this.loadMeta()
    }

    // check for ads, same as in _tag.vue
    if (global.window !== undefined) {
      const checkAdblock = () => {
        this.ads = global.adsbygoogle.loaded === true
      }

      if (global.document.readyState === 'complete') {
        setTimeout(checkAdblock, 5000) // TODO make this smarter
      } else {
        global.window.addEventListener('load', checkAdblock)
      }
    }
  },
  methods: {
    sortBy(prop) {
      if (this.comparator === prop) {
        this.order *= -1
      } else {
        this.comparator = prop
        this.order = +1
      }

      this.$ga.event('meta', 'sort_by', `${this.comparator} ${this.order < 0 ? 'desc' : 'asc'}`)
    },
    ...mapActions({
      loadMeta: 'loadMeta',
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
