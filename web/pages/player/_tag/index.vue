<template>
  <div class="flex flex-wrap">
    <div class="w-full md:w-1/2 card-wrapper">
      <div class="card card--dark card__content">
        <h3 class="card__header">
          Personal Records
        </h3>

        <p class="card__text">
          Compare your profile statistics against pro players.
        </p>

        <div class="card__teaser relative">
          <player-lifetime
            :stats="player.stats"
            tease
          ></player-lifetime>
          <div class="card__hider">
          </div>
        </div>

        <div class="card__more">
          <nuxt-link
            class="button button--md"
            :to="{
              path: `/player/${player.tag}/records`,
              hash: '#top',
            }">
            Open
          </nuxt-link>
        </div>
      </div>
    </div>

    <div
      v-if="player.battles.length > 0"
      class="w-full md:w-1/2 card-wrapper"
    >
      <div class="card card--dark card__content">
        <h3 class="card__header">
          Battle Log
        </h3>

        <p class="card__text">
          See your latest battles and calculate your Win Rate.
        </p>

        <div class="card__teaser relative">
          <player-battles
            :player="player"
            :battlePage="0"
            tease
          ></player-battles>
          <div class="card__hider">
          </div>
        </div>

        <div class="card__more">
          <nuxt-link
            class="button button--md"
            :to="`/player/${player.tag}/battles`"
          >
            Open
          </nuxt-link>
        </div>
      </div>
    </div>

    <div class="w-full md:w-1/2 card-wrapper">
      <div class="card card--dark card__content">
        <h3 class="card__header">
          Game Mode Win Rates
        </h3>

        <p class="card__text">
          View your win rate in different modes and get personalized recommendations.
        </p>

        <div class="card__teaser relative">
          <player-mode-winrates
            :player="player"
            :battles-by-mode="battlesByMode"
            :active-map-meta="activeMapMeta"
            :show-all-modes="false"
            tease
          ></player-mode-winrates>
          <div class="card__hider">
          </div>
        </div>

        <div class="card__more">
          <nuxt-link
            class="button button--md"
            :to="`/player/${player.tag}/modes`"
          >
            Open
          </nuxt-link>
        </div>
      </div>
    </div>

    <div class="w-full md:w-1/2 card-wrapper">
      <div class="card card--dark card__content">
        <h3 class="card__header">
          Brawlers
        </h3>

        <p class="card__text">
          View Trophy Graphs and Win Rates for all of your Brawlers.
        </p>

        <div class="card__teaser relative">
          <player-brawlers
            :player="player"
            tease
          />
          <div class="card__hider">
          </div>
        </div>

        <div class="card__more">
          <nuxt-link
            class="button button--md"
            :to="`/player/${player.tag}/brawlers`"
          >
            Open
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { MapMetaMap } from '../../../model/MetaEntry'
import { Player } from '../../../model/Api'

export default Vue.extend({
  head() {
    // TODO
    const description = `Brawl Time for ${this.player.name}: ${Math.floor(this.player.hoursSpent)} hours spent, ${this.player.trophies} Trophies. Track Brawl Stars stats, calculate your Win Rate and get Tips.`
    return {
      title: this.player.name,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      default: {}
    },
  },
  computed: {
    battlesByMode() {
      return this.player.battles.reduce((battlesByMode, battle) => ({
        ...battlesByMode,
        [battle.event.mode]: [...(battlesByMode[battle.event.mode] || []), battle],
      }), {})
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
.card__teaser {
  @apply mt-2 relative;
}

.card__hider {
  @apply absolute bottom-0 left-0 w-full h-full;
  background: linear-gradient(to bottom, rgba(45, 55, 72, 0.0) 0%, rgba(45, 55, 72, 0.9) 75%);
}

.card__more {
  @apply -mt-4 flex justify-center relative z-10;
}
</style>
