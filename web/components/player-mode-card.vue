<template>
  <event-card
    :mode="mode"
    v-bind="$attrs"
  >
    <div slot="content">
      <dl class="flex">
        <dd class="font-semibold">
          {{ winRate }}
        </dd>
        <dt class="ml-1">
          {{ $t('metric.winRate') }}
        </dt>
      </dl>
      <p class="text-xs">
        {{ stats.wins }} {{ $t('metric.wins' )}} / {{ stats.losses }} {{ $t('metric.losses') }}</p>
      <div
        v-if="recommendedBrawlers.length > 0"
        class="flex justify-between md:flex-row-reverse md:justify-end my-3 h-32"
      >
        <div class="md:ml-2 w-full">
          <div>
            <h6 class="font-semibold">{{ activeMap.map }}</h6>
            <p class="text-xs">{{ $t('player.recommendation') }}</p>
          </div>
          <ol class="flex mt-2 w-32">
            <li
              v-for="brawler in recommendedBrawlers"
              :key="brawler.id"
              class="flex-shrink-0 w-10 h-12 leading-none mr-1 bg-gray-800 text-center"
            >
              <router-link
                :to="localePath('/tier-list/brawler/' + brawler.id)"
              >
                <media-img
                  :path="'/brawlers/' + brawler.id + '/avatar'"
                  :alt="brawler"
                  size="160"
                  clazz="h-8"
                ></media-img>
                <span class="text-xs">{{ brawler.name }}</span>
              </router-link>
            </li>
          </ol>
        </div>
        <div class="w-24 flex flex-col justify-center">
          <media-img
            :path="'/maps/' + activeMap.id"
            size="384"
            clazz="px-1"
            ztyle="max-height: 100%;"
          ></media-img>
          <b-button
            tag="router-link"
            :to="localePath(activeMap.url)"
            class="mx-auto"
            primary
            xs
          >
            {{ $t('action.open') }}
          </b-button>
        </div>
      </div>
      <div v-else class="mt-2">
        <b-button
          tag="router-link"
          :to="localePath(`/tier-list/mode/${modeKebab}`)"
          primary
          xs
        >
          {{ $t('action.open.thing', { thing: $tc('thing.tier-list', 1) })}}
        </b-button>
      </div>
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
import Vue, { PropType } from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { Brawler, Battle } from '~/model/Api'
import { camelToKebab, slugify } from '@/lib/util'
import { commonMeasurements } from '~/lib/cube'
import { EventMetadata } from '~/plugins/clicker'

interface Row {
  picks: number
  battle_victory: number
}

interface Stats {
  winRate: number
  picks: number
  wins: number
  losses: number
}

interface ActiveMap {
  id: number
  map: string
  brawlers: string[]
  url: string
}

interface BrawlerId {
  id: string
  name: string
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
  },
  data() {
    return {
      data: {} as Row,
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

    const data = await this.$clicker.query('player.winrates.mode',
      'battle',
      [],
      ['picks', 'battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw('battle'),
        battle_event_mode: [this.mode],
        player_tag: [this.playerTag],
      },
      { sort: { picks: 'desc' }, cache: 60 })

    this.data = data.data[0]

    // TODO there might be a second one when Power Play or competition entry is online
    const map = this.activeEvents.find(e => e.battle_event_mode == this.mode)
    if (map != undefined) {
      const totals = await this.$clicker.query('player.winrates.mode-totals', 'map',
        ['brawler_name'],
        ['battle_victory'],
        {
          ...this.$clicker.defaultSlicesRaw('map'),
          battle_event_mode: [this.mode],
          battle_event_id: [map.battle_event_id.toString()],
        },
        { sort: { battle_victory: 'desc' }, cache: 60*60 })

      this.activeMap = {
        id: map.battle_event_id,
        map: map.battle_event_map,
        brawlers: totals.data.map(b => b.brawler_name),
        url: `/tier-list/mode/${camelToKebab(map.battle_event_mode)}/map/${slugify(map.battle_event_map)}`,
      }
    }
  },
  computed: {
    stats(): Stats {
      if (this.data.picks != undefined) {
        const wins = Math.floor(this.data.battle_victory * this.data.picks)
        const losses = Math.floor((1 - this.data.battle_victory) * this.data.picks)
        return {
          winRate: this.data.battle_victory,
          picks: this.data.picks,
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
    recommendedBrawlers(): BrawlerId[] {
      if (this.activeMap == undefined) {
        return []
      }

      // score =
      //   index [ brawlers owned by player, worst first ]
      //     *
      //   index [ brawler in map meta, best first ]
      const worstBrawlers = this.playerBrawlers.slice()
        .sort((b1, b2) => b1.trophies - b2.trophies)
      const bestBrawlers = this.activeMap!.brawlers

      return worstBrawlers
        .map((worstBrawler) => {
          const bestBrawlerIndex = bestBrawlers.indexOf(worstBrawler.name)
          return {
            brawler: worstBrawler,
            score: (worstBrawler.trophies + 1) * (bestBrawlerIndex / bestBrawlers.length + 1),
          }
        })
        .sort((r1, r2) => r1.score - r2.score)
        .slice(0, 3)
        .map((r) => ({
          name: capitalizeWords(r.brawler.name.toLowerCase()),
          id: brawlerId({ name: r.brawler.name }),
        }))
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
