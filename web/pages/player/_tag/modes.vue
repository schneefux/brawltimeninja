<template>
  <div class="subpage">
    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'gamemodes'),
        once: true,
      }"
      class="subpage__title section-heading"
    >
      <h2 class="page-h2">
        Game Mode Win Rates
      </h2>

      <p>
        View your win rate in different modes and get personalized recommendations.
      </p>
    </div>

    <div class="subpage__content">
      <div class="section">
        <player-mode-winrates
          :player="player"
          :battles="player.battles"
          :active-map-meta="activeMapMeta"
        ></player-mode-winrates>
      </div>

      <div class="mt-1 w-full flex justify-end">
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
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { Player } from '../../../model/Api'
import { MapMetaMap } from '../../../model/MetaEntry'

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
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      default: {}
    },
  },
  data() {
    return {
    }
  },
  mounted() {
    // workaround for https://github.com/nuxt/nuxt.js/issues/5359
    this.$scrollTo(this.$el, 0, { offset: -96 })
  },
  computed: {
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
