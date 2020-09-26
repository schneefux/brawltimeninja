<template>
  <div class="container mx-auto">
    <div class="section card card--dark px-3 py-2">
      <h6 class="text-lg font-semibold">
        Best Brawlers by {{ metaStatMaps.labels[stat] }}
      </h6>
      <p class="mt-1">
        {{ metaStatMaps.descriptions[stat] }}
      </p>
      <p>
        Click on a Brawler to learn more about them.
      </p>
      <ul class="mt-2">
        <li
          v-for="(entries, tier) in tiers"
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
              <li class="mt-1 mr-2 w-16 md:w-20 bg-gray-900 rounded-sm relative">
                <media-img
                  :path="`/brawlers/${brawlerId({ name: entry.brawler })}/avatar`"
                  :alt="entry.brawler"
                  size="160"
                  clazz="h-12 md:h-16"
                />
                <media-img
                  v-if="entry.icon"
                  :path="entry.icon"
                  size="80"
                  clazz="h-6 md:h-8 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1"
                />
                <p class="my-1 font-semibold text-lg text-center">
                  {{ !(stat in entry.stats) || tier == '?' ? '?' : typeof entry.stats[stat] == 'string' ? entry.stats[stat] : metaStatMaps.formatters[stat](entry.stats[stat]) }}
                </p>
              </li>
            </nuxt-link>
          </ul>
        </li>
      </ul>
      <p class="text-xs tracking-tight text-gray-600">Tier List by brawltime.ninja, created {{ today }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, brawlerId } from '../lib/util'

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
    stat: {
      type: String,
      required: true
    },
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
    sampleSizeThreshold: {
      type: Number,
      default: 200
    },
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    brawlerId() {
      return brawlerId
    },
    today(): string {
      return new Date().toLocaleDateString()
    },
    tiers(): TierList {
      return groupStatIntoTiers(this.entries, this.stat, this.sampleSizeThreshold)
    },
  },
})
</script>
