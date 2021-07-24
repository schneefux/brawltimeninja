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
      <div class="absolute w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 right-0 z-0">
        <shimmer
          v-if="player == undefined"
          class="w-full h-full"
          loading
      ></shimmer>
        <media-img
          v-if="player != undefined"
          :path="`/avatars/${player.icon.id}`"
        ></media-img>
      </div>
      <h1 class="text-4xl font-semibold relative z-10">
        {{ $t('player.statistics-for') }}
        <span class="text-yellow-400">{{ player == undefined ? '...' : player.name }}</span>
        <span
          v-if="tag == 'V8LLPPC'"
          class="align-top text-xs text-yellow-400 border-2 border-yellow-400 rounded-lg px-1 font-black"
        >DEV</span>
      </h1>
    </div>

    <player-hype-stats
      :player="player"
      :battle-totals="battleTotals"
      class="mt-6"
    ></player-hype-stats>

    <div class="mt-2 flex flex-wrap justify-center items-center">
      <history-graph
        v-if="enableClickerStats"
        :player-tag="tag"
        size="h-40"
        md
      ></history-graph>
      <card
        v-else
        :loading="player == undefined"
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
      </card>

      <experiment
        v-if="player != undefined"
        experiment-id="6tVxIoWeQAqhjqUk4ow8Sw"
      >
        <player-quiz
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'quiz'),
            once: true,
          }"
          :player="player"
          highlighted
        ></player-quiz>

        <player-quiz
          slot="1"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'quiz'),
            once: true,
          }"
          :player="player"
        ></player-quiz>

        <quiz-cta-card
          slot="2"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'quiz'),
            once: true,
          }"
        ></quiz-cta-card>

        <quiz-cta-card
          slot="3"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'quiz'),
            once: true,
          }"
          highlighted
        ></quiz-cta-card>

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

    <template v-if="player != undefined">
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
          {{ $t('player.disclaimer', { battles: battleTotals.picks }) }}
        </p>
      </div>

      <player-teaser-card
        v-if="battleTotals.picks > 0"
        v-slot="props"
        :pages="Math.ceil(battleTotals.picks / 6)"
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
          :battle-totals="battleTotals"
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
    </template>

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

    <template v-if="player != undefined">
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
    </template>

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

    <template v-if="player != undefined">
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
    </template>

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
import { BattleTotalRow } from '@/components/player/player-battles-stats.vue'
import { tagToId } from '~/lib/util'
import { Player } from '~/model/Api'

export default Vue.extend({
  head(): MetaInfo {
    const description = this.player == undefined ? '' : this.$t('player.meta.description', { name: this.player.name }) as string
    const tag = this.$route.params.tag
    const name = this.player?.name || tag
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
      player: undefined as undefined|Player,
      battleTotals: {
        picks: 0,
        winRate: 0,
        trophyChange: 0,
        brawler: '?',
      } as BattleTotalRow,
    }
  },
  computed: {
    tag(): string {
      return this.$route.params.tag
    },
    enableClickerStats(): boolean {
      // do not send queries to backend if user has no battle history in database
      return this.battleTotals.picks > 25
    },
    topBrawlerId(): string {
      if (this.player == undefined) {
        return ''
      }
      const brawlerIds = [...Object.keys(this.player.brawlers)]
      return brawlerIds[0]
    },
    ...mapState({
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
    setTimeout(() => this.refreshTimer(), 15 * 1000)
  },
  fetchDelay: 0,
  async fetch() {
    await Promise.all([this.refreshPlayer(), this.refreshBattleTotals()])
  },
  methods: {
    async refreshTimer() {
      this.refreshSecondsLeft -= 15
      if (this.refreshSecondsLeft <= 0) {
        await this.refresh()
      }
      setTimeout(() => this.refreshTimer(), 15 * 1000)
    },
    async refresh() {
      await this.$fetch()
      this.refreshSecondsLeft = 180
    },
    async refreshPlayer() {
      this.player = await this.$http.$get<Player>(this.$config.apiUrl + `/api/player/${this.tag}`)

      if (this.battleTotals.picks <= 25) {
        // calculate battleTotals from battle log in case cube has no data
        const picks = this.player.battles.length
        const trophyChanges = this.player.battles
          .map((battle) => battle.trophyChange!)
          .filter((trophyChange) => trophyChange != undefined)
        const trophyChange = trophyChanges.length == 0 ? 0 : trophyChanges.reduce((sum, t) => sum + t, 0) / trophyChanges.length
        const winRate = this.player.battles.length == 0 ? 0 : this.player.battles.filter((battle) => battle.victory).length / this.player.battles.length

        this.battleTotals = {
          picks,
          trophyChange,
          winRate,
          brawler: '?', // TODO
        } as BattleTotalRow
      }
    },
    async refreshBattleTotals() {
      const battleData = await this.$cube.query({
        cubeId: 'battle',
        dimensionsIds: [],
        measurementsIds: ['picks', 'winRate', 'trophyChange'],
        slices: {
          playerId: [tagToId(this.tag)],
        },
        sortId: 'picks',
        comparing: false,
        comparingSlices: {},
      })

      if (battleData.data[0].measurementsRaw.picks > 0) {
        this.battleTotals = battleData.data[0].measurementsRaw as any as BattleTotalRow
      }
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
