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
                  :path="`/brawlers/${brawlerId({ name: entry.brawlers[0] })}/avatar`"
                  :alt="entry.brawlers[0]"
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
import { brawlerId, compare1, MetaGridEntry, metaStatMaps, scaleEntriesIntoTiers } from '../lib/util'

function groupTiers(entries: MetaGridEntry[], stat: string): TierList {
  if (entries.length <= 2) {
    return {}
  }

  const scaledEntries = scaleEntriesIntoTiers(entries, stat)

  const tierMap = { S: [], A: [], B: [], C: [], D: [] } as Record<string, MetaGridEntry[]>
  scaledEntries.forEach(e => e.tier in tierMap ? tierMap[e.tier].push(e) : tierMap[e.tier] = [e])

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
