<template>
  <div>
    <div class="flex flex-wrap justify-center">
      <div
        v-for="entry in sortedEntries"
        :key="entry.id"
        class="card-wrapper w-full md:flex-1"
        itemscope
        itemtype="http://schema.org/Person"
      >
        <brawler-card
          :title="entry.title"
          :brawler="entry.brawler"
          :icon="entry.icon"
          class="h-auto"
        >
          <template v-slot:stats>
            <table v-if="entry.sampleSize >= sampleSizeThreshold">
              <tbody>
                <tr
                  v-for="stat in stats"
                  :key="stat"
                  class="card__props whitespace-no-wrap"
                  itemscope
                  itemtype="http://schema.org/QuantitativeValue"
                >
                  <td class="text-center">
                    <img
                      v-if="metaStatMaps.icons[stat].length > 2"
                      :src="require(`~/assets/images/icon/${metaStatMaps.icons[stat]}_optimized.png`)"
                      :alt="stat"
                      class="card-prop-icon inline"
                    >
                    <!-- use emojis (length 2) -->
                    <span
                      v-else
                      class="card-prop-icon"
                    >
                      {{ metaStatMaps.icons[stat] }}
                    </span>
                  </td>
                  <td class="card-prop-value text-right pr-1" itemprop="unitText">
                    {{ typeof entry.stats[stat] == 'string' ? entry.stats[stat] : metaStatMaps.formatters[stat](entry.stats[stat]) }}
                  </td>
                  <td class="card-prop-label" itemprop="value">
                    {{ metaStatMaps.labels[stat] }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              v-else
              class="h-16 flex"
            >
              <span class="m-auto">Not enough data.</span>
            </div>
          </template>
          <template v-slot:link>
            <nuxt-link
              v-if="entry.link !== undefined"
              :to="entry.link"
              class="mt-2 button button--secondary button--xs"
              itemprop="url"
            >
              More Statistics
            </nuxt-link>
          </template>
        </brawler-card>
      </div>
    </div>

    <div class="mt-2 w-full text-right">
      <button
        class="button button--md button--secondary"
        @click="downloadCsv()"
      >
        Download Data
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, compare1 } from '../lib/util'

interface IndexedMetaGridEntry extends MetaGridEntry {
  index: number
}

export default Vue.extend({
  props: {
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
    defaultStat: {
      type: String,
      required: false
    },
    gaCategory: {
      type: String,
      required: true,
    },
    sampleSizeThreshold: {
      type: Number,
      default: 200
    },
  },
  data() {
    const defaultStat = this.defaultStat || (this.entries.length === 0 ? ''
      : metaStatMaps.propPriority.find(prop => prop in this.entries[0].stats)) as string

    return {
      selectedStat: defaultStat,
      metaStatMaps,
    }
  },
  computed: {
    stats(): string[] {
      if (this.entries.length == 0) {
        return []
      }
      return Object.keys(this.entries[0].stats)
        .filter((key) => this.entries[0].stats[key] != undefined
          && !isNaN(parseFloat(this.entries[0].stats[key].toString())))
    },
    sortedEntries(): IndexedMetaGridEntry[] {
      return this.entries.slice()
        .sort(compare1(this.selectedStat as any))
        .map((entry, index) => ({
          ...entry,
          index: index + 1,
        }))
    },
  },
  methods: {
    downloadCsv() {
      this.$ga.event(this.gaCategory, 'click', 'download_csv')

      const csv = 'title,brawler,sampleSize,' + this.stats.join(',') + '\n'
        + this.sortedEntries.map(entry => entry.title + ',' + entry.brawler + ',' + entry.sampleSize + ',' + this.stats.map(stat => entry.stats[stat]).join(',')).join('\n')
      const downloader = document.createElement('a')
      downloader.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
      downloader.target = '_blank'
      downloader.download = 'export.csv'
      downloader.click()
    },
    sortBy(stat: string) {
      this.selectedStat = stat
      this.$ga.event(this.gaCategory, 'sort_by', `${this.selectedStat}`)
    },
  },
})
</script>
