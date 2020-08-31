<template>
  <div class="subpage">
    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'gamemodes'),
        once: true,
      }"
      class="section-heading"
    >
      <h2 class="text-2xl font-semibold">
        Game Mode Win Rates
      </h2>
    </div>

    <div class="section">
      <player-mode-winrates
        :player="player"
        :battles-by-mode="battlesByMode"
        :active-map-meta="activeMapMeta"
        :show-all-modes="showAllModes"
      ></player-mode-winrates>
    </div>

    <div class="mt-1 w-full flex justify-end">
      <button
        :class="{
          'md:block': !this.showAllModes,
          'mr-3 button md:button--md hidden': true,
        }"
        @click="showAllModes = true; $ga.event('gamemodes', 'show_all')"
      >
        Show More
      </button>

      <player-tips
        :player="player"
        :active-map-meta="activeMapMeta"
        class="mr-3 button md:button--md"
      ></player-tips>

      <nuxt-link
        class="button md:button--md"
        to="/tier-list/map"
      >
        Open Map Tier List
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { Player } from '../../../model/Api'

export default Vue.extend({
  head() {
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
  },
  data() {
    return {
      showAllModes: false,
      activeMapMeta: {},
    }
  },
  mounted() {
    // workaround for https://github.com/nuxt/nuxt.js/issues/5359
    this.$scrollTo(this.$el, 0, { offset: -96 })
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
