<template>
  <div>
    <div class="flex flex-wrap justify-center">
      <brawler-card
        v-for="entry in sortedEntries"
        :key="entry.id"
        :title="entry.title"
        :brawler="entry.brawler"
        :brawler-id="brawlerId({ name: entry.brawler })"
        :icon="entry.icon"
        itemscope
        itemtype="http://schema.org/Person"
      >
        <template v-slot:stats>
          <table v-if="entry.sampleSize >= sampleSizeThreshold">
            <tbody>
              <tr
                v-for="stat in stats"
                :key="stat"
                class="whitespace-nowrap"
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
          <b-button
            v-if="entry.link !== undefined"
            :to="entry.link"
            tag="router-link"
            class="mt-2"
            itemprop="url"
            secondary
            xs
          >
            More Statistics
          </b-button>
        </template>
      </brawler-card>
    </div>

    <div class="mt-2 w-full text-right">
      <b-button
        md
        secondary
        @click="downloadCsv()"
      >
        Download Data
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, compare1, brawlerId } from '../lib/util'

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
    brawlerId() {
      return brawlerId
    },
  },
  methods: {
    downloadCsv() {
      this.$gtag.event('click', {
        'event_category': this.gaCategory,
        'event_label': 'download_csv',
      })

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
      this.$gtag.event('sort_by', {
        'event_category': this.gaCategory,
        'event_label': this.selectedStat,
      })
    },
  },
})
</script>
