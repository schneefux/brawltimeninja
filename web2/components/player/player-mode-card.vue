<template>
  <event-card :mode="mode">
    <template v-slot:content><div >
      <b-card
        :elevation="0"
        dense
      >
        <template v-slot:content><b-kv-table
          
          :rows="kvTableRows"
          :data="kvTableData"
          id-key="tag"
        ></b-kv-table></template>
      </b-card>

      <b-card
        v-if="activeMap != undefined"
        :title="$t('player.tips-for.map', { map: mapName })"
        :elevation="0"
        class="mt-2"
        dense
      >
        <template v-slot:preview><map-img
          
          :id="activeMap.id"
          :map="activeMap.map"
          clazz="h-10"
        ></map-img></template>
        <template v-slot:content><player-map-tip-roll
          
          :map="activeMap.map"
          :mode="mode"
          :player-brawlers="playerBrawlers"
          class="mx-auto"
        ></player-map-tip-roll></template>
      </b-card>
    </div></template>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useAsync, useContext } from 'vue'
import { Player, Battle } from '~/model/Api'
import { camelToKebab, slugify, tagToId } from '@/lib/util'
import { EventMetadata } from '~/plugins/klicker'
import { winRateMetric } from '~/lib/klicker.cubes'
import { BKvTable } from '@schneefux/klicker/components'
import { getMapName } from '~/composables/map'

interface Stats {
  winRate: number
  picks: number
  wins: number
  losses: number
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
    mode: {
      type: String,
      required: true,
    },
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
    playerBrawlers: {
      type: Object as PropType<Player['brawlers']>,
      required: true,
    },
    activeEvents: {
      type: Array as PropType<EventMetadata[]>,
      required: true,
    },
  },
  setup(props) {
    const { $klicker } = useContext()

    const updateData = async () => {
      const data = await $klicker.query({
        cubeId: 'battle',
        dimensionsIds: [],
        metricsIds: ['picks', 'winRate'],
        sortId: 'picks',
        slices: {
          playerId: [tagToId(props.playerTag)],
          mode: [props.mode],
        },
      })

      return data.data[0]
    }

    const data = useAsync(updateData, `player-${props.playerTag}-mode-${props.mode}`)

    const activeMap = computed(() => {
      // TODO there might be a second one when Power Play or competition entry is online
      const map = props.activeEvents
        .filter(e => !e.map.startsWith('Competition '))
        .find(e => e.mode == props.mode)

      if (map != undefined) {
        return {
          id: map.id,
          map: map.map,
          url: `/tier-list/mode/${camelToKebab(map.mode)}/map/${slugify(map.map)}`,
        }
      }
    })

    const stats = computed<Stats>(() => {
      if (data.value?.metricsRaw?.picks != undefined && data.value.metricsRaw.picks > 0) {
        const wins = Math.floor((data.value.metricsRaw.winRate as number) * (data.value.metricsRaw.picks as number))
        const losses = (data.value.metricsRaw.picks as number) - wins
        return {
          winRate: data.value.metricsRaw.winRate as number,
          picks: data.value.metricsRaw.picks as number,
          wins,
          losses,
        }
      }

      const battles = props.battles.filter((b) => b.event.mode == props.mode)
      const picks = battles.length
      const wins = battles.filter(b => b.victory).length
      const losses = picks - wins
      const winRate = picks == 0 ? 0 : wins / picks
      return {
        winRate,
        picks,
        wins,
        losses,
      }
    })

    const winRate = computed(() => stats.value.picks > 5 ? $klicker.format(winRateMetric, stats.value.winRate) : '?')

    const { i18n } = useContext()
    const mapName = computed(() => {
      if (activeMap.value != undefined) {
        return getMapName(i18n, activeMap.value.id, activeMap.value.map)
      }
    })

    const kvTableRows = computed(() => ([{
      title: i18n.t('metric.winRate'),
      key: 'winRate',
    }, {
      title: i18n.t('metric.wins'),
      key: 'wins',
    }, {
      title: i18n.t('metric.losses'),
      key: 'losses',
    }]))

    const kvTableData = computed(() => ({
      winRate: winRate.value,
      wins: stats.value.wins,
      losses: stats.value.losses,
    }))

    return {
      mapName,
      activeMap,
      stats,
      winRate,
      kvTableRows,
      kvTableData,
    }
  },
})
</script>
