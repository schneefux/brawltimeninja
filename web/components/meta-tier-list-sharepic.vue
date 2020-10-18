<template>
  <sharepic @done="done">
    <div class="h-full w-full card--dark py-3 px-6 relative z-0">
      <span class="font-semibold">
        Best Brawlers by {{ metaStatMaps.labels[stat] }}
      </span>
      <div class="mt-1">
        <div
          v-for="(entries, tier) in tiers"
          :key="tier"
          class="py-1 mt-px flex bg-gray-900"
        >
          <div class="w-6 mx-2 flex justify-center items-center">
            <span class="text-2xl font-bold">{{ tier }}</span>
          </div>
          <div class="w-full flex flex-wrap justify-start">
            <div
              v-for="entry in entries"
              :key="entry.id"
            >
              <div class="my-px w-12 relative">
                <media-img
                  :path="`/brawlers/${brawlerId({ name: entry.brawler })}/avatar`"
                  :alt="entry.brawler"
                  size="160"
                  clazz="h-8"
                />
                <media-img
                  v-if="entry.icon"
                  :path="entry.icon"
                  :alt="entry.title"
                  size="80"
                  clazz="w-4 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full py-1 absolute bottom-0 left-0 z-10 bg-gray-800 px-6 flex justify-between text-xs tracking-tight text-gray-600">
        <span>
          <template v-if="description != undefined">
            {{ description }}
          </template>
          <template v-else>
            created {{ today }}
          </template>
        </span>
        <span>brawltime.ninja</span>
      </div>
    </div>
  </sharepic>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, brawlerId, compare1 } from '../lib/util'

interface TierList {
  [tier: string]: MetaGridEntry[]
}

export default Vue.extend({
  props: {
    tiers: {
      type: Object as PropType<TierList>,
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
    metaStatMaps() {
      return metaStatMaps
    },
    brawlerId() {
      return brawlerId
    },
    today(): string {
      return new Date().toLocaleDateString()
    },
  },
  methods: {
    done() {
      this.$ga.event('tierlist', 'click', 'share')
    },
  },
})
</script>
