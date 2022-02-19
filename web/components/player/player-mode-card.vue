<template>
  <event-card
    :mode="mode"
    full-height
  >
    <div slot="content">
      <b-card
        :elevation="0"
        dense
      >
        <div slot="content">
          <dl slot="content" class="flex">
            <dd class="font-semibold">
              {{ winRate }}
            </dd>
            <dt class="ml-1">
              {{ $t('metric.winRate.mode', { mode: $t('mode.' + mode) }) }}
            </dt>
          </dl>
          <p class="text-xs">
            {{ stats.wins }} {{ $t('metric.wins' )}} / {{ stats.losses }} {{ $t('metric.losses') }}
          </p>
        </div>
      </b-card>

      <b-card
        v-if="activeMap != undefined"
        :title="$t('player.tips-for.map', { map: $t('map.' + activeMap.id) })"
        :elevation="0"
        class="mt-2"
        dense
      >
        <map-img
          slot="preview"
          :id="activeMap.id"
          :map="activeMap.map"
          clazz="h-10"
        ></map-img>
        <player-map-tip-roll
          slot="content"
          :map="activeMap.map"
          :mode="mode"
          :player-brawlers="playerBrawlers"
          :limit="4"
          class="mx-auto"
        ></player-map-tip-roll>
      </b-card>
    </div>
    <div class="absolute top-0 right-0 mr-6 my-4">
      <media-img
        :path="'/modes/' + modeKebab + '/icon'"
        :alt="mode"
        size="120"
        clazz="w-12 mr-1"
      ></media-img>
    </div>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useAsync, useContext } from '@nuxtjs/composition-api'
import { Brawler, Battle } from '~/model/Api'
import { camelToKebab, slugify, tagToId } from '@/lib/util'
import { EventMetadata } from '~/plugins/klicker'
import { winRateMetric } from '~/lib/klicker.conf'

interface Stats {
  winRate: number
  picks: number
  wins: number
  losses: number
}

export default defineComponent({
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
      type: Array as PropType<Brawler[]>,
      required: true,
    },
    activeEvents: {
      type: Array as PropType<EventMetadata[]>,
      required: true,
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
  setup(props) {
    const { $klicker } = useContext()

    const updateData = async () => {
      if (!props.enableKlickerStats) {
        return undefined
      }

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
        .find(e => e.map == props.mode)

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
    const modeKebab = computed(() => camelToKebab(props.mode))

    return {
      activeMap,
      stats,
      modeKebab,
      winRate,
    }
  },
})
</script>
