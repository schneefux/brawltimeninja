<template>
  <div class="mx-auto max-w-6xl">
    <b-horizontal-scroller
      class="children-flex-auto children-shrink-0"
      expand-on-desktop
    >
      <bigstat
        :title="$t('metric.hours-spent')"
        class="relative"
        md
      >
        <div
          slot="value"
          class="w-full text-center"
        >
          <p
            ref="counter-hours"
            class="text-6xl font-bold text-yellow-400 mb-2"
          >
            ...
          </p>

          <share-render-button
            :embed-url="`/embed/profile/${player.tag}`"
            :url="playerUrl"
            class="inline-block mb-1"
            secondary
            sm
            @share="sharepicTriggered"
          ></share-render-button>
        </div>
      </bigstat>

      <div class="flex flex-col">
        <p class="mx-2">{{ $t('player.equals') }}</p>
        <div class="flex children-flex-auto children-shrink-0">
          <bigstat
            v-for="(stat, statName) in funStats"
            :key="statName"
            :title="stat.label"
          >
            <p
              slot="value"
              ref="counter-funstats"
              class="text-center text-3xl font-bold text-yellow-400 mb-1"
            >
              ...
            </p>
          </bigstat>
        </div>
      </div>
    </b-horizontal-scroller>

    <b-horizontal-scroller
      class="mt-2 lg:justify-start children-shrink-0 children-flex-auto"
      expand-on-desktop
    >
      <bigstat
        v-if="player != undefined && player.club.tag != undefined"
        :title="$t('club')"
      >
        <div
          slot="value"
          class="flex justify-center"
        >
          <nuxt-link
            :to="localePath(`/club/${player.club.tag}`)"
            class="text-center text-3xl font-semibold underline text-red-500 mb-1"
          >
            [{{ player.club.name.replace(/ /g, '&nbsp;')}}]
          </nuxt-link>
        </div>
      </bigstat>

      <bigstat
        :title="$t('metric.trophies')"
        :value="player != undefined ? player.trophies.toLocaleString() : '?'"
      ></bigstat>

      <bigstat
        v-if="brawlersUnlocked < totalBrawlers"
        :title="$t('metric.potentialTrophies')"
        :value="Math.floor(trophiesGoal).toLocaleString()"
        :tooltip="$t('metric.potentialTrophies.subtext')"
      ></bigstat>

      <bigstat
        v-if="playerTotals != undefined && playerTotals.picks > 0"
        :title="$t('metric.recentWinrate')"
        :value="Math.floor(playerTotals.winRate * 100) + '%'"
        :tooltip="$t('metric.recentWinrate.description', { battles: playerTotals.picks })"
      ></bigstat>

      <bigstat
        v-if="playerTotals != undefined && playerTotals.picks > 0"
        :title="$t('metric.averageTrophies')"
        :value="playerTotals.trophyChange.toFixed(2)"
      ></bigstat>

      <bigstat
        :title="$t('metric.accountRating')"
        :value="accountRating"
        tooltip
      >
        <template v-slot:tooltip>
          <p class="mt-2">{{ $t('metric.accountRating.description') }}</p>
          <ul class="mt-1 mb-2">
            <li
              v-for="(info, rating) in ratingPercentiles"
              :key="rating"
            >{{ rating }}: {{ $t('rating.percentile', { percentile: info[0] * 100 + '%' }) }} (up to {{ info[1] }} Trophies)</li>
          </ul>
        </template>
      </bigstat>
    </b-horizontal-scroller>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { Player } from '@/model/Api'
import { ratingPercentiles } from '~/lib/util'
import { PlayerTotals } from '~/store'
import { BHorizontalScroller } from '~/klicker/components'

export default Vue.extend({
  components: {
    BHorizontalScroller,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    playerTotals: {
      type: Object as PropType<PlayerTotals>,
      required: false
    },
  },
  mounted() {
    this.$nextTick(() => this.startCounter())
  },
  computed: {
    ratingPercentiles() {
      return ratingPercentiles
    },
    brawlersUnlocked(): number|string {
      return Object.keys(this.player.brawlers).length
    },
    trophiesGoal(): number|string {
      const brawlerTrophies = [...Object.values(this.player.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      return medBrawlerTrophies * this.totalBrawlers
    },
    accountRating(): string {
      const medTrophies = this.trophiesGoal as number / this.totalBrawlers
      // measured on 2020-11-01 with data from 2020-10-01
      // select quantile(0.25)(player_trophies/player_brawlers_length), quantile(0.375)(player_trophies/player_brawlers_length), quantile(0.5)(player_trophies/player_brawlers_length), quantile(0.90)(player_trophies/player_brawlers_length), quantile(0.95)(player_trophies/player_brawlers_length), quantile(0.99)(player_trophies/player_brawlers_length) from battle where trophy_season_end>=now()-interval 28 day and timestamp>now()-interval 28 day and timestamp<now()-interval 27 day and battle_event_powerplay=0
      for (const key in ratingPercentiles) {
        if (medTrophies <= ratingPercentiles[key][1]) {
          return key
        }
      }
      return '?'
    },
    funStats(): { [name: string]: { label: string, value: (n: number) => number } } {
      return {
        recharges: {
          // measured with AccuBattery on my phone
          label: this.$t('metric.battery') as string,
          value: (h) => h / 4.27
        },
        toiletBreaks: {
          // https://www.unilad.co.uk/featured/this-is-how-much-of-your-life-youve-spent-on-the-toilet/
          // 102 minutes over 7 days = 1/4 h/day, assuming 1 session/day
          label: this.$t('metric.toilet') as string,
          value: (h) => h / (102 / 7 / 60)
        },
        books: {
          // https://io9.gizmodo.com/how-long-will-it-take-to-read-that-book-this-chart-giv-1637170555
          label: this.$t('metric.book') as string,
          value: (h) => h / 7.72
        },
        songs: {
          // https://www.statcrunch.com/5.0/viewreport.php?reportid=28647&groupid=948
          label: this.$t('metric.song') as string,
          value: (h) => h / (3.7 / 60)
        },
      }
    },
    playerUrl(): string {
      return (process.client ? window.location.origin : '')
        + this.localePath('/player/' + this.player.tag)
        + '?utm_source=share&utm_medium=image&utm_campaign=hype-stats'
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
  methods: {
    startCounter() {
      const playerHours = Math.max(this.player.hoursSpent, 1)
      const animationDuration = 3000

      const setCounters = (hoursSpent: number) => {
        const counter = this.$refs['counter-hours'] as HTMLElement
        if (counter == undefined) {
          // not rendered yet
          return
        }
        counter.textContent = Math.floor(hoursSpent).toString()
        Object.values(this.funStats).forEach((stat, index) => {
          const funCounter = this.$refs['counter-funstats']![index] as HTMLElement
          funCounter.textContent = Math.floor(stat.value(hoursSpent)).toString()
        })
      }

      let animationStart = undefined as number|undefined
      const animateHours = () => window.requestAnimationFrame((timestamp) => {
        if (animationStart == undefined) {
          animationStart = timestamp
        }
        if (timestamp - animationStart >= animationDuration) {
          return
        }

        const easeOutCubic = 1 - Math.pow(1 - (timestamp - animationStart) / animationDuration, 3)
        const hoursSpent = playerHours * easeOutCubic
        setCounters(hoursSpent)

        animateHours()
      })

      animateHours()
    },
    sharepicTriggered() {
      this.$gtag.event('click', {
        'event_category': 'profile',
        'event_label': 'share',
      })
    },
  },
})
</script>

<style lang="postcss" scoped>
.children-flex-auto > * {
  @apply flex-auto;
}

.children-shrink-0 > * {
  @apply shrink-0;
}
</style>
