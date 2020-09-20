<template>
  <div class="mt-6">
    <div class="flex items-center justify-center">
      <div class="w-16 flex-shrink-0">
        <span>Sort By</span>
      </div>
      <div class="flex flex-wrap">
        <button
          v-for="stat in stats"
          :key="stat"
          class="mr-3 my-1 button button-sm"
          :class="{ 'button--selected': selectedStat == stat }"
          @click="sortBy(stat)"
        >
          {{ metaStatMaps.labels[stat] }}
        </button>
      </div>
    </div>

    <div class="container mx-auto">
      <div class="section-heading">
        <h5 class="text-xl font-semibold">Tier List</h5>
      </div>
      <div class="section bg-gray-800 px-3 py-2">
        <h6 class="text-lg font-semibold">
          Best Brawlers by {{ metaStatMaps.labels[selectedStat] }}
        </h6>
        <p class="mt-1">
          {{ metaStatMaps.descriptions[selectedStat] }}
        </p>
        <p>
          Click on a Brawler to learn more about them.
        </p>
        <ul class="mt-2">
          <li
            v-for="(entries, tier) in tiersBySelectedStat"
            :key="tier"
            class="my-4 flex"
          >
            <div class="w-6 mr-3 flex justify-center items-center">
              <span class="text-3xl font-bold">{{ tier }}</span>
            </div>
            <ul class="w-full flex flex-wrap justify-start">
              <nuxt-link
                v-for="entry in entries"
                :key="entry.id"
                :to="entry.link || ''"
              >
                <li class="mt-1 mr-2 w-16 md:w-20 bg-black rounded-sm relative">
                  <media-img
                    :path="`/brawlers/${entry.brawler}/avatar`"
                    :alt="entry.brawler"
                    size="160"
                    clazz="h-12 md:h-16"
                  />
                  <media-img
                    v-if="entry.icon"
                    :path="entry.icon"
                    size="80"
                    clazz="h-6 md:h-8 absolute top-0 right-0 bg-black bg-opacity-75 rounded-full p-1"
                  />
                  <p class="my-1 font-semibold text-lg text-center">
                    {{ !(selectedStat in entry.stats) || tier == '?' ? '?' : typeof entry.stats[selectedStat] == 'string' ? entry.stats[selectedStat] : metaStatMaps.formatters[selectedStat](entry.stats[selectedStat]) }}
                  </p>
                </li>
              </nuxt-link>
            </ul>
          </li>
        </ul>
        <p class="text-xs tracking-tight text-gray-600">Tier List by brawltime.ninja, created {{ today }}</p>
      </div>
    </div>

    <div class="section-heading">
      <h5 class="w-full text-xl font-semibold">All Statistics</h5>
    </div>

    <div class="section flex flex-wrap justify-center">
      <div
        v-for="entry in sortedEntries"
        :key="entry.id"
        class="card-wrapper w-full md:flex-1"
        itemscope
        itemtype="http://schema.org/Person"
      >
        <brawler-card
          v-if="entry.adSlot === undefined"
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
            <nuxt-link
              v-if="entry.link !== undefined"
              :to="entry.link"
              class="link"
              itemprop="url"
            >
              More Statistics
            </nuxt-link>
          </template>
        </brawler-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatMode, metaStatMaps, MetaGridEntry } from '../lib/util'

interface IndexedMetaGridEntry extends MetaGridEntry {
  index: number
}

interface TierList {
  [tier: string]: MetaGridEntry[]
}

function compare(entry1: MetaGridEntry, entry2: MetaGridEntry, stat: string): number {
  const sign = metaStatMaps.signs[stat] as number
  const e1stat = Number.parseFloat((entry1.stats[stat] || 0).toString())
  const e2stat = Number.parseFloat((entry2.stats[stat] || 0).toString())
  return sign * (e1stat - e2stat)
}

function compare1(stat: string) {
  return (entry1: MetaGridEntry, entry2: MetaGridEntry) => compare(entry1, entry2, stat)
}

function groupStatIntoTiers(entries: MetaGridEntry[], stat: string, sampleSizeThreshold: number): TierList {
  if (entries.some(b => !(stat in b.stats))) {
    return {
      '?': entries
    }
  }

  const sign = metaStatMaps.signs[stat] as number
  const stats = entries.map(b => Number.parseFloat(b.stats[stat].toString()))
  const avg = stats.reduce((sum, s) => sum + s, 0) / entries.length
  const std = Math.sqrt(
    stats.reduce((sum, s) => sum + Math.pow(avg - s, 2), 0) / entries.length
  )
  const ks = { S: 1, A: 0.5, B: -0.5, C: -1, D: -Infinity }
  const tiers = { S: [], A: [], B: [], C: [], D: [] } as { [tier: string]: MetaGridEntry[] }

  for (let entry of entries) {
    if (entry.sampleSize < sampleSizeThreshold) {
      if (!('?' in tiers)) {
        tiers['?'] = []
      }
      tiers['?'].push(entry)
      continue
    }

    for (let [tier, bound] of Object.entries(ks)) {
      if (sign == -1) {
        if (Number.parseFloat(entry.stats[stat].toString()) > avg + bound * std) {
          tiers[tier].push(entry)
          break;
        }
      } else {
        if (Number.parseFloat(entry.stats[stat].toString()) < avg - bound * std) {
          tiers[tier].push(entry)
          break;
        }
      }
    }
  }

  for (let tier of Object.keys(tiers)) {
    tiers[tier].sort(compare1(stat))
  }

  return tiers
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
      formatMode,
      metaStatMaps,
    }
  },
  computed: {
    today(): string {
      return new Date().toLocaleDateString()
    },
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
        .sort(compare1(this.selectedStat))
        .map((entry, index) => ({
          ...entry,
          index: index + 1,
        }))
    },
    tiersBySelectedStat(): TierList {
      return groupStatIntoTiers(this.entries, this.selectedStat, this.sampleSizeThreshold)
    },
  },
  methods: {
    sortBy(stat: string) {
      this.selectedStat = stat
      this.$ga.event(this.gaCategory, 'sort_by', `${this.selectedStat}`)
    },
  },
})
</script>
