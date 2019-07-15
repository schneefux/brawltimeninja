<template>
  <div class="mx-auto py-4 px-2">
    <div
      :class="{ 'md:bg-grey-lighter md:text-black': !forceMobile }"
      class="py-8 px-6 my-8 relative"
    >
      <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
        Meta
      </h1>
      <p class="mb-3 text-center">
        Statistics from Pro Battles on Brawl Time Ninja this week.
      </p>

      <div class="my-8 mx-auto text-center flex flex-wrap justify-center items-center">
        <div class="w-full text-center mb-5">
          <span class="font-semibold">
            Current Events
          </span>
          <button
            v-for="event in currentEventsWithData"
            :key="event.id"
            class="bg-primary-lighter border-primary-lighter hover:bg-primary-lightest hover:border-primary-lightest ml-2 rounded border-2 py-1 px-2 text-black mt-2"
            @click="selectedEvent = event"
          >
            {{ formatMode(event.mode) }}
            -
            {{ event.map }}
          </button>
        </div>
        <div>
          <label class="font-semibold">
            Mode
            <select
              v-model="selectedMode"
              :class="{
                'bg-primary-light border-primary-light hover:bg-primary-lighter hover:border-primary-lighter': forceMobile,
              }"
              class="ml-2 w-40 rounded border-2 py-1 px-2 text-black"
              @change="selectedProp = 'trophies'; order = +1"
            >
              <option
                v-for="mode in modes"
                :key="mode"
                :value="mode"
              >
                {{ formatMode(mode) }}
              </option>
            </select>
          </label>
        </div>
        <div class="md:ml-6 mt-4 md:mt-0">
          <label class="font-semibold">
            Map
            <select
              v-model="selectedMap"
              :class="{
                'bg-primary-light border-primary-light hover:bg-primary-lighter hover:border-primary-lighter': forceMobile,
              }"
              class="ml-2 w-40 rounded border-2 py-1 px-2 text-black"
              @change="selectedProp = 'trophies'; order = +1"
            >
              <option
                v-for="map in maps"
                :key="map"
                :value="map"
              >
                {{ map }}
              </option>
            </select>
          </label>
        </div>
      </div>

      <p
        v-if="totalSampleSize < 1000"
        class="my-8 text-center"
      >
        Not enough data for this event yet! Play a few battles and come back later.
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
              {{ metaStatMaps.formatters[prop](brawler[prop]) }}
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
              root-class=""
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

function formatMode(mode) {
  const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  const capitalize = str => str.replace(/(?:^|\s)\S/g, a => a.toUpperCase())
  return camelToSnakeCase(mode)
    .split('_')
    .map(w => capitalize(w))
    .join(' ')
}

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
    return {
      selectedProp: 'trophyChange',
      selectedEvent: {},
      order: +1,
      forceMobile: true,
      formatMode,
    }
  },
  computed: {
    selectedMode: {
      get() {
        return this.selectedEvent.mode
      },
      set(mode) {
        this.selectedEvent = this.events
          .find(event => mode === event.mode)
      }
    },
    selectedMap: {
      get() {
        return this.selectedEvent.map
      },
      set(map) {
        this.selectedEvent = this.events
          .find(event => this.selectedMode === event.mode && map === event.map)
      }
    },
    modes() {
      return [...new Set(this.events.map(event => event.mode))]
    },
    maps() {
      return this.events
        .filter(event => event.mode === this.selectedMode)
        .map(event => event.map)
    },
    sortedMeta() {
      if (this.selectedEvent.id === undefined) {
        return []
      }

      const meta = this.meta.slice()
      return meta.sort(this.comparators[this.selectedProp])
        .map((entry, index) => ({
          ...entry,
          ...entry.events[this.selectedEvent.id].stats,
          index: index + 1,
        }))
    },
    events() {
      // get a list of events with data for every brawler
      const commonEventIds = this.meta.map(entry => [...Object.keys(entry.events)])
        .reduce((acc, cur, index) => index === 0 ? cur : cur.filter(m => acc.includes(m)), [])
        .sort()
      return commonEventIds.reduce((events, id) => events.concat([{
        id: id,
        mode: this.meta[0].events[id].mode,
        map: this.meta[0].events[id].map,
      }]), [])
    },
    currentEventsWithData() {
      return this.currentEvents
        .filter(({ id }) => this.events.find(({ id: id2 }) => id === id2) !== undefined)
    },
    totalSampleSize() {
      if (this.selectedEvent.id === undefined) {
        return 0
      }

      return this.meta
        .reduce((sampleSize, entry) => sampleSize + entry.events[this.selectedEvent.id].sampleSize, 0)
    },
    comparators() {
      const compareProp = (prop) => {
        return (e1, e2) => this.order * (e2[prop] - e1[prop])
      }
      const comparators = {
        trophies: compareProp('trophies'),
        spTrophies: compareProp('spTrophies'),
        trophyChange: compareProp('trophyChange'),
      }

      if (this.meta.length === 0 || this.selectedEvent.id === undefined) {
        return comparators
      }

      // add mode statistics that have values not null
      Object.entries(this.meta[0].events[this.selectedEvent.id].stats).forEach(([prop, value]) => {
        if (value !== null && value !== 0) {
          comparators[prop] = (e1, e2) => this.order * (e2.events[this.selectedEvent.id].stats[prop] - e1.events[this.selectedEvent.id].stats[prop])
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
      meta: state => state.meta,
      metaByMode: state => state.metaByMode,
      currentEvents: state => state.currentEvents,
      ads: state => state.adsAllowed,
    }),
    ...mapGetters({
      metaStatMaps: 'metaStatMaps',
    })
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadCurrentEvents')
      await store.dispatch('loadMeta')
    }
  },
  async mounted() {
    if (process.static) {
      await this.loadCurrentEvents()
      await this.loadMeta()
    }
    this.selectedEvent = this.events[0]
  },
  methods: {
    sortBy(prop) {
      if (this.selectedProp === prop) {
        this.order *= -1
      } else {
        this.selectedProp = prop
        this.order = +1
      }

      this.$ga.event('meta', 'sort_by', `${this.selectedProp} ${this.order < 0 ? 'desc' : 'asc'}`)
    },
    ...mapActions({
      loadMeta: 'loadMeta',
      loadCurrentEvents: 'loadCurrentEvents',
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
