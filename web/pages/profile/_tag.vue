<template>
  <page>
    <client-only>
      <adsense
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9429125351"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
      <div style="height: 300px;" class="adswrapper ad-section w-full" slot="placeholder"></div>
    </client-only>

    <div
      class="mt-4 relative"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'hours'),
        once: true,
      }"
    >
      <media-img
        :path="`/avatars/${player.icon.id}`"
        clazz="absolute w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 right-0 z-0"
      ></media-img>
      <h1 class="text-4xl font-semibold relative z-10">
        {{ $t('player.statistics-for') }}
        <span class="text-yellow-400">{{ player.name }}</span>
        <span
          v-if="tag == 'V8LLPPC'"
          class="align-top text-xs text-yellow-400 border-2 border-yellow-400 rounded-lg px-1 font-black"
        >DEV</span>
      </h1>
    </div>

    <player-hype-stats
      :player="player"
      :player-totals="playerTotals"
      class="mt-6"
    ></player-hype-stats>

    <div class="mt-2 flex flex-wrap justify-center items-center">
      <history-graph
        v-if="enableClickerStats"
        :player-tag="tag"
        size="h-40"
        md
      ></history-graph>
      <b-card
        v-else
        class="h-16 md:h-32"
        full-height
        md
      >
        <div slot="content" class="flex flex-col justify-center h-full">
          <p
            slot="content"
            class="italic text-center"
          >
            {{ $t('player.no-history') }}
          </p>
        </div>
      </b-card>

      <experiment experiment-id="FMx-6NeaSwCpwc0UMG4NFg">
        <player-quiz
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'quiz'),
            once: true,
          }"
          :player="player"
        ></player-quiz>

        <quiz-card
          slot="1"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'quiz'),
            once: true,
          }"
        ></quiz-card>
      </experiment>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3933066188"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      :title="$t('player.records.title')"
      :description="$t('player.records.description')"
    >
      <player-lifetime
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'lifetime'),
          once: true,
        }"
        :player="player"
        :tease="!props.open"
      ></player-lifetime>

      <player-percentiles
        v-show="props.open"
        :player="player"
      ></player-percentiles>
    </player-teaser-card>

    <div class="my-1 md:my-4 mx-1 md:ml-4 flex items-center">
      <h2 class="text-2xl font-semibold">
        Info!
      </h2>
      <p class="text-xs ml-3">
        {{ $t('player.disclaimer', { battles: playerTotals != undefined ? playerTotals.picks : 25 }) }}
      </p>
    </div>

    <player-teaser-card
      v-if="playerTotals != undefined && playerTotals.picks > 0"
      v-slot="props"
      :pages="Math.ceil(playerTotals.picks / 6)"
      :title="$tc('battle-log', 1)"
      :description="$t('player.battle-log.description')"
    >
      <player-battles-squares
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'battles'),
          once: true,
        }"
        :battles="player.battles"
        :tease="!props.open"
      ></player-battles-squares>

      <div
        v-show="props.open"
        class="w-full md:w-auto md:ml-auto mt-2 flex items-center"
      >
        <span class="text-sm text-grey-lighter">
          {{ $t('player.updating-in', { minutes: Math.floor(refreshSecondsLeft / 60), seconds: refreshSecondsLeft % 60 }) }}
        </span>
        <b-button
          class="ml-auto md:ml-4"
          sm
          primary
          @click="refresh"
        >
          {{ $t('action.refresh') }}
        </b-button>
      </div>

      <player-battles-stats
        v-show="props.open"
        :player-totals="playerTotals"
      ></player-battles-stats>

      <player-battles
        v-show="props.open"
        :player="player"
        :limit="(props.page || 1) * 6"
      ></player-battles>
    </player-teaser-card>

    <install-card
      class="mx-auto"
    ></install-card>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4129048243"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      :title="$tc('mode', 2)"
      :description="$t('player.modes.description')"
    >
      <player-mode-winrates
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gamemodes'),
          once: true,
        }"
        :player="player"
        :battles="player.battles"
        :tease="!props.open"
        :enable-clicker-stats="enableClickerStats"
        :elevation="2"
      ></player-mode-winrates>

      <div
        v-show="props.open"
        class="mt-2 w-full flex justify-end"
      >
        <b-button
          :to="localePath('/tier-list/map')"
          md
          primary
          prefetch
        >
          {{ $t('action.open.tier-list.maps') }}
        </b-button>
      </div>
    </player-teaser-card>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1752268168"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      :pages="Math.ceil(Object.keys(player.brawlers).length) / 15"
      :title="$tc('brawler', 2)"
      :description="$t('player.brawlers.description')"
    >
      <player-brawlers
        :player="player"
        :tease="!props.open"
        :limit="props.page * 15"
        :enable-clicker-stats="enableClickerStats"
      ></player-brawlers>
    </player-teaser-card>

    <page-section
      title="Guides from the Blog"
      tracking-id="articles"
      tracking-page-id="profile"
    >
      <blogroll topic="guides"></blogroll>
    </page-section>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { Player } from '~/model/Brawlstars'
import { PlayerTotals } from '~/store'

export default Vue.extend({
  head(): MetaInfo {
    const description = this.$t('player.meta.description', { name: this.player.name }) as string
    const name = this.player.name
    const tag = this.$route.params.tag
    return {
      title: this.$t('player.meta.title', { name }) as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:image', property: 'og:image', content: this.$config.renderUrl + `/embed/profile/${tag}` },
        { hid: 'og:image:alt', property: 'og:image:alt', content: `${name} Brawl Stars Profile share image` },
        { hid: 'og:image:type', property: 'og:image:type', content: 'image/png' },
        // 2x the .sharepic size
        { hid: 'og:image:width', property: 'og:image:width', content: '1200' },
        { hid: 'og:image:height', property: 'og:image:height', content: '630' },
      ]
    }
  },
  meta: {
    title: 'Profile',
    screen: 'profile',
  },
  middleware: ['cached'],
  data() {
    return {
      refreshSecondsLeft: 180,
      timer: undefined as undefined|number,
    }
  },
  computed: {
    tag(): string {
      return this.$route.params.tag
    },
    enableClickerStats(): boolean {
      // do not send queries to backend if user has no battle history in database
      return (this.playerTotals?.picks || 0) > 25
    },
    topBrawlerId(): string {
      const brawlerIds = [...Object.keys(this.player.brawlers)]
      return brawlerIds[0]
    },
    ...mapState({
      player: (state: any) => state.player as Player,
      playerTotals: (state: any) => state.playerTotals as PlayerTotals|undefined,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async validate({ store, params, redirect }) {
    const tag = params.tag.toUpperCase()
    if (tag != params.tag) {
      // fuck Bing for lowercasing all URLs
      redirect(`/profile/${tag}`)
      return false
    }

    return RegExp(store.state.tagPattern).test(tag)
  },
  mounted() {
    this.timer = window.setTimeout(() => this.refreshTimer(), 15 * 1000)
  },
  destroyed() {
    window.clearTimeout(this.timer)
  },
  async asyncData({ store, params, error, i18n }) {
    if (store.state.player == undefined || store.state.player.tag != params.tag) {
      try {
        await store.dispatch('loadPlayer', params.tag)
      } catch (err: any) {
        if (err.response?.status == 404) {
          error({ statusCode: 404, message: i18n.tc('error.tag.not-found') })
        } else {
          console.error(err)
          this.$sentry.captureException(err)
          error({ statusCode: err.response.status, message: i18n.tc('error.api-unavailable') })
        }
        return
      }
    }

    return {}
  },
  methods: {
    async refreshTimer() {
      this.refreshSecondsLeft -= 15
      if (this.refreshSecondsLeft <= 0) {
        await this.refresh()
      }
      this.timer = window.setTimeout(() => this.refreshTimer(), 15 * 1000)
    },
    async refresh() {
      try {
        await this.$store.dispatch('loadPlayer', this.$route.params.tag)
      } catch (err: any) {
        if (err.response?.status != 404) {
          console.error(err)
          this.$sentry.captureException(err)
        }
      }
      this.refreshSecondsLeft = 180
    },
    trackScroll(visible, entry, section) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'profile',
          'event_label': section,
        })
      }
    },
  },
})
</script>
