<template>
  <div class="relative">
    <div class="section items-center justify-center flex flex-wrap">
      <div class="mx-auto md:mx-0 flex">
        <dl>
          <dd ref="counter-hours" class="text-5xl text-secondary font-bold">
            ...
          </dd>
          <dt class="text-3xl text-white">
            hours spent
          </dt>
        </dl>
        <nuxt-link
          v-if="rank !== 0"
          to="/leaderboard/hours"
          class="text-4xl -ml-4 text-primary-light font-bold"
        >
          #{{ rank }}
        </nuxt-link>
      </div>

      <div
        v-show="!showAll"
        class="w-full md:hidden mt-1"
      >
        <button
          class="relative z-10 button button--secondary button--xs text-sm"
          @click="showAll = true"
        >
          &#9660; show fun facts
        </button>
      </div>

      <p
        v-show="showAll"
        class="md:block w-full md:w-auto text-xl my-4 mx-auto"
      >
        which is about
      </p>

      <dl
        v-show="showAll"
        class="md:flex flex-wrap justify-between z-20"
      >
        <div
          v-for="(stat, statName) in funStats"
          :key="statName"
          class="mx-auto px-2 my-3"
        >
          <dd ref="counter-funstats" class="text-3xl text-secondary font-semibold">
            ...
          </dd>
          <dt class="text-2xl text-grey-lighter">
            {{ stat.label }}
          </dt>
        </div>
      </dl>
    </div>

    <div class="absolute top-0 left-0 z-0 -mt-2 md:-mt-8">
      <button
        v-if="!triggerShare"
        @click="triggerShare = true"
        class="button button--secondary"
      >Share</button>
      <span
        v-if="triggerShare"
        class="italic"
      >Generating your Sharepic...</span>
      <lazy-player-sharepic
        v-if="triggerShare"
        :player="player"
        :win-rate="winRate"
        :total-battles="totalBattles"
        :account-rating="accountRating"
        :history="history"
        @done="triggerShare = false"
      ></lazy-player-sharepic>
    </div>

    <div class="section bigstat-wrapper">
      <dl
        v-if="player.club.tag != undefined"
        class="bigstat-container"
      >
        <nuxt-link
          :to="`/club/${player.club.tag}`"
          class="block bigstat-left text-5vw md:text-4xl!"
        >
          <div style="margin-top: -0.125em">
            [
          </div>
          <dd class="mx-2 text-primary-light font-semibold text-center">
            {{ player.club.name.replace(/ /g, '&nbsp;') }}
          </dd>
          <div style="margin-top: -0.125em">
            ]
          </div>
        </nuxt-link>
        <dt class="bigstat-right bigstat-label text-4xl">
          Club
        </dt>
      </dl>

      <div class="bigstat-container">
        <dl class="flex flex-wrap">
          <dd class="bigstat-left bigstat-number">
            {{ player.trophies.toLocaleString() }}
          </dd>
          <dt class="bigstat-right bigstat-label text-4xl">
            Trophies
          </dt>
        </dl>

        <div class="w-full max-w-xs my-3 md:my-0 md:w-80 relative">
          <div class="h-24 md:h-20 flex flex-col justify-center">
            <client-only>
              <history-graph
                v-if="history.length > 1"
                :history="history"
              ></history-graph>
              <span v-else class="italic">
                Come back later to see progress charts
              </span>
            </client-only>
          </div>
        </div>
      </div>

      <dl
        v-if="brawlersUnlocked < totalBrawlers"
        class="bigstat-container"
      >
        <dd class="bigstat-left bigstat-number">
          {{ Math.floor(trophiesGoal).toLocaleString() }}
        </dd>
        <div class="bigstat-right">
          <dt class="bigstat-label w-48 pt-1">
            <span class="text-xl">
              Potential&nbsp;Trophies
            </span>
            <span class="text-sm">
              (with&nbsp;all&nbsp;Brawlers&nbsp;unlocked)
            </span>
          </dt>
        </div>
      </dl>

      <dl class="bigstat-container" v-if="winRate !== 0">
        <div class="bigstat-left relative">
          <dd class="bigstat-number">
            {{ Math.floor(winRate * 100) }}%
          </dd>
          <button
            @click="recentHelpOpen = true"
            class="bigstat-tooltip-btn"
          >?</button>
          <p
            v-if="recentHelpOpen"
            @click="recentHelpOpen = false"
            class="bigstat-tooltip-text"
          >
            Your last {{ totalBattles }} battles are used for "Recent" statistics. <br>
            The Recent Win Rate takes 3v3 wins and Showdown rankings into account.
            <span class="bigstat-tooltip-close">x</span>
          </p>
        </div>
        <div class="bigstat-right bigstat-label text-xl">
          <dt class="w-24">
            Recent Win&nbsp;Rate
          </dt>
        </div>
      </dl>

      <dl class="bigstat-container" v-if="trophyRate !== 0">
        <dd class="bigstat-left bigstat-number">
          {{ trophyRate.toFixed(2) }}
        </dd>
        <div class="bigstat-right bigstat-label text-xl">
          <dt class="w-24">
            Recent&nbsp;Trophies per&nbsp;battle
          </dt>
        </div>
      </dl>

      <dl class="bigstat-container">
        <div class="bigstat-left relative">
          <dd class="bigstat-number">{{ accountRating }}</dd>
          <button
            @click="ratingHelpOpen = true"
            class="bigstat-tooltip-btn"
          >?</button>
          <p
            v-if="ratingHelpOpen"
            @click="ratingHelpOpen = false"
            class="bigstat-tooltip-text"
          >
            Ratings are calculated by comparing mean Brawler trophies to all players on Brawl Time Ninja.
            <ul>
              <li>C: Better than 50%</li>
              <li>B: Better than 90%</li>
              <li>A: Better than 95%</li>
              <li>S: Better than 99%</li>
            </ul>
            <span class="bigstat-tooltip-close">x</span>
          </p>
        </div>
        <div class="bigstat-right bigstat-label text-xl">
          <dt class="w-24">
            Account Rating
          </dt>
        </div>
      </dl>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { Player, LeaderboardEntry } from '../model/Api'
import { TrophiesRow } from '../model/Clicker'
import { BattleTotalRow } from './player-battles-stats.vue'

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    hoursLeaderboard: {
      type: Array as PropType<LeaderboardEntry[]>,
      default: () => []
    },
    battleTotals: {
      type: Object as PropType<BattleTotalRow>,
      required: false
    },
    enableClickerStats: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      showAll: false,
      ratingHelpOpen: false,
      recentHelpOpen: false,
      history: [] as TrophiesRow[],
      triggerShare: false,
    }
  },
  watch: {
    enableClickerStats: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    if (!this.enableClickerStats) {
      return
    }

    const data = await this.$clicker.query('player.history',
      'brawler',
      ['timestamp'],
      ['timestamp', 'player_trophies'],
      {
        ...this.$clicker.defaultSlices('brawler'),
        player_tag: [this.player.tag],
      },
      { cache: 60*60 })
    this.history = data.data.map(b => ({
      timestamp: b.timestamp,
      trophies: b.player_trophies,
    } as TrophiesRow))
  },
  mounted() {
    if ((<any>process).client) {
      this.$nextTick(() => {
        const playerHours = Math.max(this.player.hoursSpent, 1)
        const animationDuration = 3000
        const frameDuration = 50
        const k = Math.log(playerHours) / (animationDuration / frameDuration)

        let hoursSpent = 0
        const hoursTimer = () => setTimeout(() => {
          hoursSpent += k * (playerHours - hoursSpent)
          if (Math.floor(hoursSpent) >= playerHours - 1) {
            hoursSpent = playerHours
          }

          const counter = this.$refs['counter-hours'] as HTMLElement
          if (counter == undefined) {
            // user navigated to a different page
            return
          }

          counter.textContent = Math.floor(hoursSpent).toString()
          Object.values(this.funStats).forEach((stat, index) => {
            const funCounter = this.$refs['counter-funstats'][index] as HTMLElement
            funCounter.textContent = Math.floor(stat.value(hoursSpent)).toString()
          })

          if (Math.floor(hoursSpent) < playerHours) {
            hoursTimer()
          }
        }, frameDuration)
        hoursTimer()
      })
    }
  },
  methods: {
    share() {
      this.triggerShare = true
    },
  },
  computed: {
    rank(): number|undefined {
      const rank = this.hoursLeaderboard.findIndex(e => e.tag == this.player.tag)
      if (rank == undefined) {
        return undefined
      }
      return rank + 1
    },
    brawlersUnlocked(): number {
      return Object.keys(this.player.brawlers).length
    },
    trophiesGoal(): number {
      const brawlerTrophies = [...Object.values(this.player.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      return medBrawlerTrophies * this.totalBrawlers
    },
    trophyRate(): number {
      if (this.battleTotals != undefined && this.battleTotals != undefined) {
        return this.battleTotals.battle_trophy_change || 0
      }

      const trophyChanges = this.player.battles
        .map((battle) => battle.trophyChange!)
        .filter((trophyChange) => trophyChange != undefined)
      if (trophyChanges.length == 0) {
        return 0
      }
      return trophyChanges.reduce((sum, t) => sum + t, 0) / trophyChanges.length
    },
    winRate(): number {
      if (this.battleTotals != undefined && this.battleTotals.battle_victory != undefined) {
        return this.battleTotals.battle_victory
      }
      if (this.player.battles.length == 0) {
        return 0
      }
      return this.player.battles.filter((battle) => battle.victory).length / this.player.battles.length
    },
    totalBattles(): number {
      return this.battleTotals.picks || this.player.battles.length
    },
    accountRating(): string {
      const medTrophies = this.trophiesGoal / this.totalBrawlers
      // end of Jan 2019 season *average* (not med!) trophies per brawler:
      // 290 - 25%ile
      // 380 - 50%ile
      // 530 - 90%ile
      // 550 - 95%ile
      // 620 - 99%ile
      // TODO 2020-08-08 end of season data: mu = 457, sigma = 182
      if (medTrophies <= 290) {
        return '?'
      }
      if (medTrophies <= 380) {
        return 'C'
      }
      if (medTrophies <= 530) {
        return 'B'
      }
      if (medTrophies <= 550) {
        return 'A'
      }
      return 'S'
    },
    funStats(): { [name: string]: { label: string, value: (n: number) => number } } {
      return {
        recharges: {
          // measured with AccuBattery on my phone
          label: 'empty batteries',
          value: (h) => h / 4.27
        },
        toiletBreaks: {
          // https://www.unilad.co.uk/featured/this-is-how-much-of-your-life-youve-spent-on-the-toilet/
          // 102 minutes over 7 days = 1/4 h/day, assuming 1 session/day
          label: 'toilet breaks',
          value: (h) => h / (102 / 7 / 60)
        },
        books: {
          // https://io9.gizmodo.com/how-long-will-it-take-to-read-that-book-this-chart-giv-1637170555
          label: 'books unread',
          value: (h) => h / 7.72
        },
        songs: {
          // https://www.statcrunch.com/5.0/viewreport.php?reportid=28647&groupid=948
          label: 'songs unheard',
          value: (h) => h / (3.7 / 60)
        },
      }
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
})
</script>
