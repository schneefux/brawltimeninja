<template>
  <div class="container mx-auto">
    <div class="section card card--dark px-3 py-2">
      <p>
        Tiers are calculated from win rates and pick rates using a z-score outlier detection. <br>
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
              :title="entry.title"
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
                  :alt="entry.title"
                  size="80"
                  clazz="h-6 md:h-8 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1"
                />
              </li>
            </nuxt-link>
          </ul>
        </li>
      </ul>

      <div class="mt-2">
        <meta-tier-list-sharepic
          :tiers="tiers"
          :description="description"
        ></meta-tier-list-sharepic>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TierList, TierListEntry } from '~/model/Web'
import { brawlerId, capitalizeWords } from '../lib/util'

function groupTiers(entries: TierListEntry[]): TierList {
  // min-max scale z-scores into the 5 tiers and put nulls into '?' tier
  const scores = entries.map(e => e.stats.winsZScore).filter(e => e != undefined)
  const max = Math.max(...scores)
  const min = Math.min(...scores)
  const minMax = (v: number) => (v - min) / (max - min)
  const tierMap = { S: [], A: [], B: [], C: [], D: [] } as Record<string, TierListEntry[]>
  const tiers = ['S', 'A', 'B', 'C', 'D']

  for (const entry of entries) {
    let key = '?'
    if (entry.stats.winsZScore != undefined) {
      const index = (tiers.length - 1) - Math.floor(minMax(entry.stats.winsZScore) * (tiers.length - 1))
      key = tiers[index]
    }

    if (!(key in tierMap)) {
      tierMap[key] = [entry]
    } else {
      tierMap[key].push(entry)
    }
  }

  for (const key in tierMap) {
    tierMap[key].sort((e1, e2) => e2.stats.winsZScore - e1.stats.winsZScore)
  }

  return tierMap
}

export default Vue.extend({
  props: {
    entries: {
      type: Array as PropType<TierListEntry[]>,
      required: true
    },
    description: {
      type: String,
      required: false
    },
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    tiers(): TierList {
      return groupTiers(this.entries)
    },
  },
})
</script>
