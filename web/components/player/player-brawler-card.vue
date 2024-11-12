<template>
  <b-card
    :title="title"
    :link="localePath(`/tier-list/brawler/${brawlerId}`)"
  >
    <template v-slot:content>
      <div class="flex flex-col">
        <div class="flex items-center gap-x-8">
          <media-img
            :path="`/brawlers/${brawlerId}/avatar`"
            :alt="brawler.name"
            size="160"
            clazz="w-20 h-20 rounded object-contain"
          ></media-img>

          <div class="w-full grid grid-cols-[repeat(auto-fit,2rem)] justify-items-center items-center gap-2">
            <media-img
              v-for="starpower in brawler.starPowers"
              :key="starpower.id"
              :path="`/starpowers/${starpower.id}`"
              :alt="capitalizeWords(starpower.name.toLowerCase())"
              size="80"
            ></media-img>
            <media-img
              v-for="gadget in brawler.gadgets"
              :key="gadget.id"
              :path="`/gadgets/${gadget.id}`"
              :alt="capitalizeWords(gadget.name.toLowerCase())"
              size="80"
            ></media-img>
            <media-img
              v-for="gear in brawler.gears"
              :key="gear.id"
              :path="`/gears/${gear.name.toLowerCase()}_${gear.level}`"
              :alt="capitalizeWords(gear.name.toLowerCase())"
              size="80"
            ></media-img>
          </div>
        </div>

        <div class="h-32 mt-6">
          <history-graph
            :brawler="brawler.name"
            :player-tag="playerTag"
            :current-trophies="brawler.trophies"
          ></history-graph>
        </div>

        <b-kv-table
          :rows="kvTableRows"
          :data="kvTableData"
          id-key="id"
          class="mt-4"
        >
          <template v-slot:masteryPoints="{ value }: { value: number }">
            <img
              :src="masteryIcon"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:rank="{ value }: { value: number }">
            <img
              :src="leaderboardsIcon"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:trophies="{ value }: { value: number }">
            <img
              :src="trophyIcon"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:power="{ value }: { value: number }">
            <img
              :src="value < 10 ? powerpointIcon : starpowerIcon"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:wins="{ value }: { value: number }">
            <span class="text-green-400">
              {{ value }}
            </span>
          </template>

          <template v-slot:losses="{ value }: { value: number }">
            <span class="text-red-400">
              {{ value }}
            </span>
          </template>
        </b-kv-table>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { Brawler, BrawlerExtra } from '~/model/Api'
import { brawlerId as getBrawlerId, capitalizeWords, formatClickhouseDate, getSeasonEnd, tagToId } from '~/lib/util'
import { subWeeks } from 'date-fns'
import { BKvTable } from '@schneefux/klicker/components'
import { useKlicker } from '@schneefux/klicker/composables'
import { useAsync } from '~/composables/compat'
import leaderboardsIcon from '~/assets/images/icon/leaderboards_optimized.png'
import trophyIcon from '~/assets/images/icon/trophy_optimized.png'
import powerpointIcon from '~/assets/images/icon/powerpoint_optimized.png'
import starpowerIcon from '~/assets/images/icon/starpower_optimized.png'
import masteryIcon from '~/assets/images/icon/mastery.png'
import { useI18n } from 'vue-i18n'

interface BrawlerWithId extends Brawler {
  id: string
}

export default defineComponent({
  components: {
    BKvTable,
  },
  props: {
    playerTag: {
      type: String,
      required: true
    },
    brawler: {
      type: Object as PropType<BrawlerWithId>,
      required: true,
    },
    brawlerExtra: {
      type: Object as PropType<BrawlerExtra>,
      default: undefined,
    },
  },
  setup(props) {
    const $klicker = useKlicker()
    const season = formatClickhouseDate(getSeasonEnd(subWeeks(new Date(), 12)))

    const fetchData = async () => {
      const response = await $klicker.query({
        cubeId: 'battle',
        slices: {
          brawler: [props.brawler.name.toUpperCase()],
          playerId: [tagToId(props.playerTag)],
          season: [season],
        },
        dimensionsIds: [],
        metricsIds: ['winRate', 'picks'],
        sortId: 'picks',
      })
      if (response.data[0].metricsRaw.picks as number > 0) {
        return {
          winrate: response.data[0].metricsRaw.winRate as number,
          picks: response.data[0].metricsRaw.picks as number,
        }
      } else {
        return null
      }
    }

    const data = useAsync(() => fetchData(), computed(() => `player-brawler-${props.playerTag}-${props.brawler.name}`))

    const brawlerId = computed(() => getBrawlerId({ name: props.brawler.name }))
    const title = computed(() => capitalizeWords(props.brawler.name.toLowerCase()))

    console.log('extra', props.brawler.name, props.brawlerExtra)

    const i18n = useI18n()
    const kvTableRows = computed(() => {
      const rows = []

      if (props.brawlerExtra?.masteryPoints) {
        rows.push({
          title: i18n.t('metric.masteryPoints'),
          key: 'masteryPoints',
          slot: 'masteryPoints',
        })
      }

      rows.push({
        title: i18n.t('metric.rank'),
        key: 'rank',
        slot: 'rank',
      })

      rows.push({
        title: i18n.t('metric.power-level'),
        key: 'power',
        slot: 'power',
      })

      rows.push({
        title: i18n.t('metric.trophies'),
        key: 'trophies',
        slot: 'trophies',
      })

      rows.push({
        title: i18n.t('metric.highest-trophies'),
        key: 'highestTrophies',
        slot: 'trophies',
      })

      if (data.value != undefined && data.value.picks > 0) {
        rows.push({
          title: i18n.t('metric.winRate'),
          key: 'winRate',
        })

        rows.push({
          title: i18n.t('metric.wins'),
          key: 'wins',
          slot: 'wins',
        })

        rows.push({
          title: i18n.t('metric.losses'),
          key: 'losses',
          slot: 'losses',
        })
      }

      return rows
    })

    const kvTableData = computed(() => ({
      id: props.brawler.name,
      masteryPoints: props.brawlerExtra?.masteryPoints,
      rank: props.brawler.rank,
      trophies: props.brawler.trophies,
      power: props.brawler.power,
      highestTrophies: props.brawler.highestTrophies,
      ...(data.value != undefined ? {
        winRate: data == undefined ? 0 : Math.floor(data.value.winrate * 100) + '%',
        wins: data == undefined ? 0 : Math.floor(data.value.winrate * data.value.picks),
        losses: data == undefined ? 0 : Math.floor((1 - data.value.winrate) * data.value.picks),
      } : {}),
    }))

    return {
      data,
      brawlerId,
      title,
      capitalizeWords,
      kvTableRows,
      kvTableData,
      leaderboardsIcon,
      trophyIcon,
      powerpointIcon,
      starpowerIcon,
      masteryIcon,
    }
  },
})
</script>
