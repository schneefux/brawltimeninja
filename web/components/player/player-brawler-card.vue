<template>
  <b-card
    :title="title"
    :link="localePath(`/tier-list/brawler/${brawlerId}`)"
    full-height
  >
    <div
      slot="content"
      class="flex flex-col"
    >
      <div class="flex items-center gap-x-8">
        <media-img
          :path="`/brawlers/${brawlerId}/avatar`"
          :alt="brawler.name"
          size="160"
          clazz="w-20 h-20 rounded object-contain"
        ></media-img>

        <div class="w-full grid grid-cols-[repeat(auto-fit,2rem)] justify-items-center items-center gap-4">
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

      <history-graph
        :brawler="brawler.name"
        :player-tag="playerTag"
        class="h-32 mt-6"
      ></history-graph>

      <b-kv-table
        :rows="kvTableRows"
        :data="kvTableData"
        id-key="id"
        class="mt-4"
      >
        <template v-slot:rank="{ row }">
          <img
            src="~/assets/images/icon/leaderboards_optimized.png"
            class="inline h-4 mr-1"
          >
          {{ row.rank }}
        </template>
        <template v-slot:trophies="{ row }">
          <img
            src="~/assets/images/icon/trophy_optimized.png"
            class="inline h-4 mr-1"
          >
          {{ row.trophies }}
        </template>
        <template v-slot:power="{ row }">
          <img
            :src="row.power < 10 ? require('~/assets/images/icon/powerpoint_optimized.png') : require('~/assets/images/icon/starpower_optimized.png')"
            class="inline h-4 mr-1"
          >
          {{ row.power }}
        </template>
        <template v-slot:wins="{ row }">
          <span class="text-green-400">
            {{ row.wins }}
          </span>
        </template>
        <template v-slot:losses="{ row }">
          <span class="text-red-400">
            {{ row.losses }}
          </span>
        </template>
      </b-kv-table>
    </div>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useAsync, useContext, watch } from '@nuxtjs/composition-api'
import { Brawler } from '~/model/Api'
import { brawlerId as getBrawlerId, capitalizeWords, formatClickhouse, getSeasonEnd, tagToId } from '~/lib/util'
import { subWeeks } from 'date-fns'
import { BKvTable } from '@schneefux/klicker/components'
import { useKlicker } from '@schneefux/klicker/composables'

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
    enableKlickerStats: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { $klicker } = useKlicker()
    const season = formatClickhouse(getSeasonEnd(subWeeks(new Date(), 12)))

    const fetchData = async () => {
      if (!props.enableKlickerStats) {
        return
      }

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
      if (response.data[0].metricsRaw.picks > 0) {
        return {
          winrate: response.data[0].metricsRaw.winRate as number,
          picks: response.data[0].metricsRaw.picks as number,
        }
      } else {
        return undefined
      }
    }

    const data = useAsync(() => fetchData(), `player-brawler-${props.playerTag}-${props.brawler.name}`)

    watch(() => props.enableKlickerStats, async () => {
      data.value = await fetchData()
    })

    const brawlerId = computed(() => getBrawlerId({ name: props.brawler.name }))
    const title = computed(() => capitalizeWords(props.brawler.name.toLowerCase()))

    const { i18n } = useContext()
    const kvTableRows = computed(() => ([{
      title: i18n.t('metric.rank'),
      key: 'rank',
      slot: 'rank',
    }, {
      title: i18n.t('metric.power-level'),
      key: 'power',
      slot: 'power',
    }, {
      title: i18n.t('metric.trophies'),
      key: 'trophies',
      slot: 'trophies',
    }, {
      title: i18n.t('metric.highest-trophies'),
      key: 'highestTrophies',
      slot: 'trophies',
    },
    ...(data.value != undefined && data.value.picks > 0 ? [{
      title: i18n.t('metric.winRate'),
      key: 'winRate',
    }, {
      title: i18n.t('metric.wins'),
      key: 'wins',
      slot: 'wins',
    }, {
      title: i18n.t('metric.losses'),
      key: 'losses',
      slot: 'losses',
    }] : [])]))

    const kvTableData = computed(() => ({
      id: props.brawler.name,
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
    }
  },
})
</script>
