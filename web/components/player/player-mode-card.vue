<template>
  <event-card
    :mode="mode"
    :elevation="elevation"
    v-bind="$attrs"
    full-height
  >
    <div slot="content">
      <card
        :elevation="elevation + 1"
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
      </card>

      <card
        v-if="activeMap != undefined"
        :title="$t('player.tips-for.map', { map: $t('map.' + activeMap.id) })"
        :elevation="elevation + 1"
        dense
      >
        <media-img
          slot="preview"
          :path="`/maps/${activeMap.id}`"
          size="80"
          clazz="h-10"
        ></media-img>
        <player-map-tip-roll
          slot="content"
          :map="activeMap.map"
          :mode="mode"
          :player-brawlers="playerBrawlers"
          :limit="4"
          :elevation="elevation + 2"
          class="mx-auto"
        ></player-map-tip-roll>
        <b-button
          slot="actions"
          tag="router-link"
          :to="localePath(activeMap.url)"
          primary
          xs
        >
          {{ $t('action.open.tier-list.map', { map: $tc('map.' + activeMap.id) }) }}
        </b-button>
      </card>
    </div>
    <div class="absolute top-0 right-0 mr-6 my-4">
      <media-img
        :path="'/modes/' + modeKebab + '/icon'"
        :alt="mode"
        size="120"
        clazz="w-12 mr-1"
      ></media-img>
    </div>
    <b-button
      v-if="activeMap == undefined"
      slot="actions"
      tag="router-link"
      :to="localePath(`/tier-list/mode/${modeKebab}`)"
      primary
      xs
    >
      {{ $t('action.open.tier-list.mode', { mode: $tc('mode.' + mode) }) }}
    </b-button>
  </event-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Brawler, Battle } from '~/model/Api'
import { camelToKebab, MetaGridEntry, slugify, tagToId } from '@/lib/util'
import { commonMeasurements } from '~/lib/cube'
import { EventMetadata } from '~/plugins/cube'

interface Stats {
  winRate: number
  picks: number
  wins: number
  losses: number
}

interface ActiveMap {
  id: number
  map: string
  url: string
}

export default Vue.extend({
  inheritAttrs: false,
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
    enableClickerStats: {
      type: Boolean,
      required: true
    },
    elevation: {
      type: Number
    },
  },
  data() {
    return {
      data: undefined as undefined|MetaGridEntry,
      activeMap: undefined as undefined|ActiveMap,
    }
  },
  watch: {
    playerTag: '$fetch',
    mode: '$fetch',
    activeEvents: '$fetch',
    enableClickerStats: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    if (!this.enableClickerStats) {
      return
    }

    const data = await this.$cube.query({
      cubeId: 'battle',
      dimensionsIds: [],
      measurementsIds: ['picks', 'winRate'],
      sortId: 'picks',
      slices: {
        playerId: [tagToId(this.playerTag)],
        mode: [this.mode],
      },
      comparing: false,
      comparingSlices: {},
    })

    this.data = data.data[0]

    // TODO there might be a second one when Power Play or competition entry is online
    const map = this.activeEvents
      .filter(e => !e.battle_event_map.startsWith('Competition '))
      .find(e => e.battle_event_mode == this.mode)

    if (map != undefined) {
      this.activeMap = {
        id: map.battle_event_id,
        map: map.battle_event_map,
        url: `/tier-list/mode/${camelToKebab(map.battle_event_mode)}/map/${slugify(map.battle_event_map)}`,
      }
    }
  },
  computed: {
    stats(): Stats {
      if (this.data?.measurementsRaw?.picks != undefined && this.data.measurementsRaw.picks > 0) {
        const wins = Math.floor((this.data.measurementsRaw.winRate as number) * (this.data.measurementsRaw.picks as number))
        const losses = (this.data.measurementsRaw.picks as number) - wins
        return {
          winRate: this.data.measurementsRaw.winRate as number,
          picks: this.data.measurementsRaw.picks as number,
          wins,
          losses,
        }
      }

      const battles = this.battles.filter((b) => b.event.mode == this.mode)
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
    },
    winRate(): string {
      return this.stats.picks > 5 ? this.$clicker.format(commonMeasurements.winRate, this.stats.winRate) : '?'
    },
    modeKebab(): string {
      return camelToKebab(this.mode)
    },
  },
})
</script>
