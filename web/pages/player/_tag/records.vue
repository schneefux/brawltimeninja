<template>
  <div class="subpage-wrapper">
    <div class="subpage">
      <nuxt-link
        class="subpage-back"
        :to="`/player/${player.tag}`"
      >
        Close
      </nuxt-link>

      <div
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'lifetime'),
          once: true,
        }"
        class="subpage__title section-heading"
      >
        <h2 class="page-h2">
          Personal Records
        </h2>

        <p>
          Compare your profile statistics against pro players.
        </p>
      </div>

      <div class="subpage__content">
        <div class="section">
          <player-lifetime :stats="player.stats"></player-lifetime>
        </div>

        <div
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'pro'),
            once: true,
          }"
          class="section-heading"
        >
          <h3 class="page-h3">
            Are you a Pro?
          </h3>
        </div>

        <div class="section">
          <player-percentiles :player="player"></player-percentiles>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
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
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      testGroup: (state: any) => state.testGroup as string,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  mounted() {
    // workaround for https://github.com/nuxt/nuxt.js/issues/5359
    this.$scrollTo(this.$el, 50, { offset: -96 })
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
