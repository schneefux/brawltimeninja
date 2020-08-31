<template>
  <div class="subpage">
    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'battles'),
        once: true,
      }"
      class="section-heading flex flex-wrap items-center"
    >
      <h2 class="text-2xl font-semibold">
        Battle Log
      </h2>

      <div class="w-full md:w-auto md:ml-auto mt-2 flex items-center">
        <span class="text-sm text-grey-lighter">
          Updating again in {{ Math.floor(refreshSecondsLeft / 60) }}m {{ refreshSecondsLeft % 60 }}s
        </span>
        <button
          class="ml-auto md:ml-4 button button-sm"
          @click="$emit('refresh')"
        >
          Refresh now
        </button>
      </div>
    </div>

    <div class="section">
      <dl class="mt-3 mb-6 bigstat-wrapper" v-if="totalBattles !== 0">
        <div class="bigstat-container">
          <dd class="bigstat-left bigstat-number bigstat-number--light">
            {{ Math.floor(winRate * totalBattles) }}
          </dd>
          <dt class="bigstat-right bigstat-label text-xl">
            Wins Recorded
          </dt>
        </div>

        <div class="bigstat-container">
          <dd class="bigstat-left bigstat-number bigstat-number--light">
            {{ Math.floor((1 - winRate) * totalBattles) }}
          </dd>
          <dt class="bigstat-right bigstat-label text-xl">
            Losses Recorded
          </dt>
        </div>

        <div class="bigstat-container">
          <dd class="bigstat-left bigstat-number bigstat-number--light leading-none">
            {{ formatMode(bestMode) }}
          </dd>
          <dt class="bigstat-right bigstat-label text-xl">
            Best Mode
          </dt>
        </div>
      </dl>

      <player-battles
        :player="player"
        :battlePage="battlePage"
      ></player-battles>

      <div
        v-show="battlePage * battlePageSize < player.battles.length"
        class="mt-2 w-full text-right hidden md:block"
      >
        <button
          class="button button--md"
          @click="battlePage++; $ga.event('battlelog', 'load_more', battlePage)"
        >
          Load More Battles
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import { formatMode } from '../../../lib/util'
import { Player } from '../../../model/Api'

export default Vue.extend({
  head() {
    return {}
    // TODO
    /*
    const description = `Brawl Time for ${this.player.name}: ${Math.floor(this.player.hoursSpent)} hours spent, ${this.player.trophies} Trophies. Track Brawl Stars stats, calculate your Win Rate and get Tips.`
    return {
      title: this.player.name,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
    */
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    refreshSecondsLeft: {
      type: Number,
      required: true
    },
  },
  data() {
    return {
      battlePage: 1,
      battlePageSize: 4,
      formatMode,
    }
  },
  mounted() {
    // workaround for https://github.com/nuxt/nuxt.js/issues/5359
    this.$scrollTo(this.$el, 0, { offset: -96 })
  },
  computed: {
    totalBattles() {
      if (this.player.winrates != undefined && this.player.winrates.total != undefined) {
        return this.player.winrates.total.stats.picks
      }
      return this.player.battles.length
    },
    winRate() {
      if (this.player.winrates != undefined && this.player.winrates.total != undefined) {
        return this.player.winrates.total.stats.winRate
      }
      if (this.player.battles.length == 0) {
        return 0
      }
      return this.player.battles.filter((battle) => battle.victory).length / this.player.battles.length
    },
    battlesByMode() {
      return this.player.battles.reduce((battlesByMode, battle) => ({
        ...battlesByMode,
        [battle.event.mode]: [...(battlesByMode[battle.event.mode] || []), battle],
      }), {})
    },
    bestMode() {
      let avgTrophyChangeByMode = [] as any[] // TODO
      if (this.player.winrates != undefined && this.player.winrates.mode != undefined) {
        avgTrophyChangeByMode = Object.values(this.player.winrates.mode || {})
          .map((m) => ({ mode: m.name, trophyChange: m.stats.trophyChange }))
          .filter((m) => m.trophyChange != undefined)
      } else {
        const rankedBattles = (battles) => battles.filter(b => b.trophyChange != undefined)
        avgTrophyChangeByMode = [...Object.entries(this.battlesByMode)]
          .map(([mode, battles]) => [mode, rankedBattles(battles)])
          .filter(([mode, battles]) => battles.length > 0)
          .map(([mode, battles]) => ({
            mode,
            trophyChange: battles.reduce((trophies, b) => trophies + b.trophyChange, 0) / battles.length,
          }))
      }
      const modes = avgTrophyChangeByMode
        .sort((m1, m2) => m2.trophyChange - m1.trophyChange)
        .map((m) => m.mode)
      if (modes.length == 0) {
        return '?'
      }
      return modes[0]
    },
    ...mapState({
      testGroup: (state: any) => state.testGroup as string,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  methods: {
    trackScroll(visible, entry, section) {
      if (visible) {
        this.$ga.event('profile', 'scroll', section)
      }
    },
  },
})
</script>

<style scoped>
.bigstat-wrapper {
  @apply flex flex-wrap mx-auto;
}

@screen md {
  .bigstat-wrapper {
    @apply justify-center mx-0;
  }
}

.bigstat-container {
  @apply flex flex-wrap justify-center items-center mt-2 w-full;
}

@screen xl {
  .bigstat-container {
    @apply mx-6 w-auto;
  }
}

.bigstat-left {
  @apply w-1/2 text-right flex justify-end items-center pr-2;
}

.text-5vw {
  font-size: 5vw;
}

@responsive {
  .text-4xl\! {
    @apply text-4xl;
  }
}

.bigstat-right {
  @apply w-1/2 text-left flex justify-start items-center pl-2;
}

.bigstat-label {
  @apply leading-none text-white;
}

.bigstat-number {
  @apply text-5xl font-bold text-secondary;
}

.bigstat-tooltip-btn {
  @apply absolute mt-2 mr-1 text-primary-light font-semibold underline top-0 right-0;
}

.bigstat-tooltip-text {
  @apply absolute top-0 left-0 text-sm w-48 bg-black text-grey-lighter rounded px-2 py-1 ml-2 text-left;
}

.bigstat-tooltip-close {
  @apply text-primary-light font-semibold absolute top-0 right-0 mr-1 cursor-pointer;
}

.bigstat-number--light {
  @apply text-3xl text-primary-light;
}

.min-width-min-content {
 min-width: min-content;
}
</style>
