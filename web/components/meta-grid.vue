<template>
  <div class="text-center flex flex-wrap justify-between items-center">
    <div
      v-if="enableSort"
      class="text-center w-full"
    >
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

    <template v-for="entry in entriesAndAds">
      <div
        v-if="(ads && !isApp) || entry.adSlot === undefined"
        :key="entry.id"
        class="card-wrapper w-full md:flex-1"
        itemscope
        itemtype="http://schema.org/Person"
      >
        <adsense
          v-if="ads && entry.adSlot !== undefined"
          ins-class="md:min-w-80 h-48 md:h-32 mx-auto"
          data-ad-client="ca-pub-6856963757796636"
          :data-ad-slot="entry.adSlot"
        />

        <brawler-card
          v-if="entry.adSlot === undefined"
          :title="entry.title"
          :brawler="entry.brawler"
          class="h-auto"
        >
          <template v-slot:history>
            <div class="mb-auto text-right">
              <span
                v-if="entry.sampleSize < 300"
                class="align-text-top mr-1 text-sm text-grey-light"
              >
                Not enough data
              </span>
              <span class="font-semibold text-white text-2xl text-shadow">
                #{{ entry.index }}
              </span>
            </div>
          </template>
          <template v-slot:stats>
            <table>
              <tr
                v-for="(_, prop) in comparators"
                :key="prop"
                class="card-props whitespace-no-wrap"
                itemscope
                itemtype="http://schema.org/QuantitativeValue"
              >
                <td class="text-center">
                  <img
                    v-if="metaStatMaps.icons[prop].length > 2"
                    :src="require(`~/assets/images/icon/${metaStatMaps.icons[prop]}_optimized.png`)"
                    :alt="prop"
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
                <td class="card-prop-value text-right pr-1" itemprop="unitText">
                  {{ metaStatMaps.formatters[prop](entry.stats[prop]) }}
                </td>
                <td class="card-prop-label" itemprop="value">
                  {{ metaStatMaps.labels[prop] }}
                </td>
              </tr>
            </table>
            <nuxt-link
              v-if="entry.link !== undefined"
              :to="entry.link"
              class="link"
              itemprop="url"
            >
              {{ linkText }}
            </nuxt-link>
          </template>
        </brawler-card>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { induceAdsIntoArray, formatMode, metaStatMaps } from '~/store/index'
import BrawlerCard from '~/components/brawler-card.vue'

export default {
  name: 'MapMetaPage',
  components: {
    BrawlerCard,
  },
  props: {
    entries: {
      /**
        {
          id,
          title,
          brawler,
          link,
          sampleSize?,
          stats[]
        }
      **/
      type: Array,
      required: true,
    },
    enableSort: {
      type: Boolean,
      default: true,
    },
    linkText: {
      type: String,
      default: '',
    },
    defaultSortProp: {
      type: String,
      default: '',
    },
    adSlots: {
      type: Array,
      required: true,
    },
    adFrequency: {
      type: Number,
      default: 7,
    },
    gaCategory: {
      type: String,
      required: true,
    },
  },
  data() {
    const defaultProp = this.defaultProp ||
      this.entries.length === 0 ? ''
      : metaStatMaps.propPriority
        .find(prop => prop in this.entries[0].stats)

    return {
      order: +1,
      selectedProp: defaultProp,
      formatMode,
      metaStatMaps,
    }
  },
  computed: {
    sortedEntries() {
      return this.entries.slice()
        .sort(this.comparators[this.selectedProp])
        .map((entry, index) => ({
          ...entry,
          index: index + 1,
        }))
    },
    entriesAndAds() {
      return induceAdsIntoArray(
        this.sortedEntries, this.adSlots, this.adFrequency)
    },
    comparators() {
      if (this.entries.length === 0) {
        return {}
      }

      return [...Object.keys(this.entries[0].stats)]
        .reduce((comparators, prop) => ({
          ...comparators,
          [prop]: (e1, e2) => this.order * (e2.stats[prop] - e1.stats[prop])
        }), {})
    },
    ...mapState({
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  methods: {
    sortBy(prop) {
      if (this.selectedProp === prop) {
        this.order *= -1
      } else {
        this.selectedProp = prop
        this.order = +1
      }

      this.$ga.event(this.gaCategory, 'sort_by', `${this.selectedProp} ${this.order < 0 ? 'desc' : 'asc'}`)
    },
  },
}
</script>
