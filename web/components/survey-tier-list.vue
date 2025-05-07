<template>
  <b-card :title="$t('tier-list.mode.tier-list', { mode: $t('mode.' + mode) })">
    <template v-slot:content>
      <ul class="space-y-2">
        <li
          v-for="(entries, tier) in tierlist"
          :key="tier"
          class="flex"
        >
          <div class="w-6 mr-3 flex justify-center items-center">
            <span class="text-2xl sm:text-2xl md:text-3xl font-bold">{{ tier }}</span>
          </div>
          <ul class="w-full flex flex-wrap justify-start items-center">
            <li
              v-for="entry in entries"
              :key="entry.brawlerId"
              class="my-px"
            >
              <router-link :to="localePath(`/tier-list/brawler/${entry.brawlerId}`)">
                <media-img
                  :path="`/brawlers/${entry.brawlerId}/avatar`"
                  :alt="entry.brawlerName"
                  size="160"
                  clazz="h-8 w-8 object-contain object-left"
                  loading="lazy"
                ></media-img>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
      <p
        v-show="sampleSize > 0"
        class="mt-6 prose dark:prose-invert"
      >{{ $t('tier-list.description', { sampleSize, since, lastUpdate } )}}</p>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useApi, useAsync } from '~/composables/compat'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { BCard } from '@schneefux/klicker/components'
import { useFormattedDate, useFormattedDistanceToNow } from '~/composables/date-fns'

interface SurveySummary {
  brawler: string
  voteRate: number
}

interface TierListEntry {
  tier: string
  brawlerId: string
  brawlerName: string
  voteRate: number
}

export interface TierList {
  [tier: string]: TierListEntry[]
}

// TODO move the data to clickhouse, then use cube and v-tier-list for this
function groupTiers(entries: SurveySummary[]): TierList {
  if (entries.length <= 2) {
    return {}
  }

  const sortedEntries = entries
    .slice()
    .sort((a, b) => a.voteRate - b.voteRate)

  const min = sortedEntries[1].voteRate! // skip highest (outlier)
  const max = sortedEntries[sortedEntries.length - 2].voteRate! // skip lowest
  const clamp = (v: number) => Math.max(min, Math.min(max, v))
  const minMax = (v: number) => (clamp(v) - min) / (max - min)
  const tiers = ['S', 'A', 'B', 'C', 'D']

  const scaledEntries = sortedEntries.map(entry => {
    const index = (tiers.length - 1) - Math.floor(minMax(entry.voteRate!) * (tiers.length - 1))
    const tier = tiers[index]

    return {
      tier,
      brawlerId: brawlerId({ name: entry.brawler }),
      brawlerName: capitalizeWords(entry.brawler),
      voteRate: entry.voteRate,
    } satisfies TierListEntry
  })

  const tierMap = { S: [], A: [], B: [], C: [], D: [] } as Record<string, TierListEntry[]>
  scaledEntries.forEach(e => e.tier in tierMap ? tierMap[e.tier].unshift(e) : tierMap[e.tier] = [e])
  // TODO check original v-tier-list, might need to replace push() by unshift() to sort within tiers

  return tierMap
}

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    mode: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const $api = useApi()

    const summary = useAsync(async () => {
      return await $api.survey.getSummary.query({
        mode: props.mode,
      })
    }, `tierlist-${props.mode}`)

    const sampleSize = computed(() => {
      if (summary.value == undefined) {
        return 0
      }
      return summary.value.sum
    })

    const tierlist = computed(() => {
      if (summary.value == undefined) {
        return {}
      }
      return groupTiers(summary.value.votes)
    })

    const since = useFormattedDate(computed(() => summary.value?.since ?? new Date()), 'PPP')

    const lastUpdate = useFormattedDistanceToNow(
      computed(() => summary.value?.lastUpdate ?? new Date()),
      { addSuffix: true },
    )

    return {
      tierlist,
      sampleSize,
      since,
      lastUpdate,
    }
  },
})
</script>
