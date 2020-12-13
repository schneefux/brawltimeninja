<template>
  <card v-bind="$attrs">
    <template v-slot:content>
      <ul>
        <li
          v-for="(entries, tier) in tiers"
          :key="tier"
          class="my-4 flex"
        >
          <div class="w-6 mr-3 flex justify-center items-center">
            <span class="text-3xl font-bold">{{ tier }}</span>
          </div>
          <ul class="w-full flex flex-wrap justify-start">
            <div
              v-if="entries.length == 0"
              class="h-12 md:h-16"
            ></div>
            <router-link
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
            </router-link>
          </ul>
        </li>
      </ul>

      <div class="mt-2">
        <meta-tier-list-sharepic
          :tiers="tiers"
          :description="description"
        ></meta-tier-list-sharepic>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TierList, TierListEntry } from '~/model/Web'
import { brawlerId, compare1, MetaGridEntry, metaStatMaps } from '../lib/util'

function groupTiers(entries: MetaGridEntry[], stat: string): TierList {
  if (entries.length <= 2) {
    return {}
  }

  const getStat = (e: MetaGridEntry) => typeof e.stats[stat] != 'string' ? e.stats[stat] as number|undefined :  Number.parseFloat(e.stats[stat] as string)
  // min-max scale stat into the 5 tiers and put nulls into '?' tier
  const stats = entries.slice()
    .sort(compare1(stat as any)).map(getStat)
    .reverse()
  const sign = metaStatMaps.signs[stat]
  const min = stats[sign == -1 ? 1 : stats.length - 2]! // skip highest (outlier)
  const max = stats[sign == -1 ? stats.length - 2 : 1]! // skip lowest
  const clamp = (v: number) => Math.max(min, Math.min(max, v))
  const minMax = (v: number) => (clamp(v) - min) / (max - min)
  const tierMap = { S: [], A: [], B: [], C: [], D: [] } as Record<string, MetaGridEntry[]>
  const tiers = ['S', 'A', 'B', 'C', 'D']

  for (const entry of entries) {
    let key = '?'
    if (getStat(entry) != undefined) {
      const index = (tiers.length - 1) - Math.floor(minMax(getStat(entry)!) * (tiers.length - 1))
      key = tiers[sign == -1 ? index : tiers.length - index - 1]
    }

    if (!(key in tierMap)) {
      tierMap[key] = [entry]
    } else {
      tierMap[key].push(entry)
    }
  }

  for (const key in tierMap) {
    tierMap[key].sort(compare1(stat as any))
  }

  return tierMap
}

export default Vue.extend({
  inheritAttrs: false,
  props: {
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    stat: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
  },
  computed: {
    tiers(): TierList {
      return groupTiers(this.entries, this.stat)
    },
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
  },
})
</script>
