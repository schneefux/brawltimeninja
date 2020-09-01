<template>
  <div class="flex flex-wrap justify-center">
    <div
      :class="{
        'w-full md:w-1/2 card-wrapper': true,
        'opening': opening.records,
        'not-opening': !opening.records,
      }"
      ref="records"
    >
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
          <div class="card__hider"></div>
        </div>

        <div class="card__more">
          <nuxt-link
            class="button button--md"
            :to="`/player/${player.tag}/records`"
          >
            Show
          </nuxt-link>
        </div>
      </div>
    </div>

    <div
      v-if="player.battles.length > 0"
      :class="{
        'w-full md:w-1/2 card-wrapper': true,
        'opening': opening.battles,
        'not-opening': !opening.battles,
      }"
      ref="battles"
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
            Show
          </nuxt-link>
        </div>
      </div>
    </div>

    <div
      :class="{
        'w-full md:w-1/2 card-wrapper': true,
        'opening': opening.modes,
        'not-opening': !opening.modes,
      }"
      ref="modes"
    >
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
            :battles="player.battles"
            :active-map-meta="activeMapMeta"
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
            Show
          </nuxt-link>
        </div>
      </div>
    </div>

    <div
      :class="{
        'w-full md:w-1/2 card-wrapper': true,
        'opening': opening.brawlers,
        'not-opening': !opening.brawlers,
      }"
      ref="brawlers"
    >
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
            Show
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
  data() {
    return {
      opening: {
        battles: false,
        brawlers: false,
        modes: false,
        records: false,
      }
    }
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
  beforeRouteLeave(to, from, next) {
    if (to.name != undefined && to.name.startsWith('player-tag-')) {
      const page = to.name.replace('player-tag-', '')
      this.$set(this.opening, page, true)
      const card = this.$refs[page] as HTMLElement
      // 100ms = duration of enter transition
      this.$scrollTo(card, 100, {
        offset: -96, // menu (expanded)
      })
    }
    next()
  },
  transition(to, from) {
    if (from != undefined && to.name != undefined &&
        from.name == 'player-tag' && to.name.startsWith('player-tag-')) {
      return 'open-card'
    }
    return 'page' // default
  },
})
</script>

<style scoped>
.card__teaser {
  @apply mt-2 relative;
}

.card__hider {
  @apply absolute top-0 left-0 w-full h-full;
  background: linear-gradient(to bottom, rgba(45, 55, 72, 0.0) 0%, rgba(45, 55, 72, 0.9) 75%);
}

.card__more {
  @apply -mt-4 flex justify-center relative z-10;
}
</style>

<style>
/* does nothing - tells vue how long to wait */
.open-card-leave-active {
  transition-duration: 100ms;
}

.open-card-leave-active .opening.card-wrapper,
.open-card-leave-active .opening .card,
.open-card-leave-active .opening .card__header,
.open-card-leave-active .opening .card__text,
.open-card-leave-active .opening .card__teaser,
.open-card-leave-active .opening .card__hider,
.open-card-leave-active .opening .card__more {
  transition-property: all;
  transition-duration: 100ms;
  transition-timing-function: ease-in;
}

/* morph the clicked card and its contents into a subpage layout */
.open-card-leave-to .opening.card-wrapper {
  /* @apply w-full m-0 p-0; */
}

.open-card-leave-to .not-opening .card {
  @apply opacity-0;
}

.open-card-leave-to .opening .card {
  /* revert .card-wrapper styles */
  @apply -my-3;
  /* .subpage styles */
  @apply -mx-2 p-2 bg-gray-800 rounded;
  @apply pb-80;
}
.open-card-leave-to .opening .card__header {
  /* .open-card-h2 styles */
  @apply text-2xl font-semibold;
  /* .section-heading styles */
  @apply mt-8;
}
.open-card-leave-to .opening .card__text {
  @apply mt-0;
}
.open-card-leave-to .opening .card__teaser {
  /* .section styles */
  @apply mt-4;
}
.open-card-leave-to .opening .card__hider {
  @apply opacity-0;
}
.open-card-leave-to .opening .card__more {
  @apply opacity-0;
}

/* make the subpage contents appear */
/* does nothing - tells vue how long to wait */
.open-card-enter-active {
  transition-duration: 50ms;
}

.open-card-enter-active,
.open-card-enter-active.subpage,
.open-card-enter-active .subpage__content {
  transition-property: all;
  transition-duration: 50ms;
  transition-timing-function: linear;
}

.open-card-enter .subpage__content {
  max-height: 8rem; /* about same as old card height */
  @apply h-full overflow-y-hidden;
}
.open-card-enter-to .subpage__content {
  @apply max-h-screen mb-0 h-full overflow-y-hidden;
}

.open-card-enter.subpage {
  @apply pb-80; /* pb reserved by card after leave transition end */
}
</style>
