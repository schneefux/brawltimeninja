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
        clazz="absolute w-16 md:w-24 lg:w-32 xl:w-40 right-0 z-0"
      ></media-img>
      <h1 class="text-4xl font-semibold relative z-10">
        {{ $t('player.statistics-for') }}
        <span class="text-yellow-400">{{ player.name }}</span>
        <span
          v-if="player.tag == 'V8LLPPC'"
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
        :player-tag="player.tag"
        size="h-40"
        md
      ></history-graph>
      <card
        v-else
      >
        <span
          slot="content"
          class="italic"
        >
          {{ $t('player.no-history') }}
        </span>
      </card>

      <player-quiz
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'quiz'),
          once: true,
        }"
        :player="player"
      ></player-quiz>
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
        {{ $t('player.disclaimer', { battles: totalBattles }) }}
      </p>
    </div>

    <player-teaser-card
      v-if="player.battles.length > 0"
      v-slot="props"
      :pages="Math.ceil(player.battles.length / 6)"
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
        :battles="player.battles"
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
import { mapState, mapActions } from 'vuex'
import { BattleTotalRow } from '@/components/player/player-battles-stats.vue'

export default Vue.extend({
  head(): MetaInfo {
    const description = this.$t('player.meta.description', { name: this.player.name }) as string
    return {
      title: this.$t('player.meta.title', { name: this.player.name }) as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:image', property: 'og:image', content: this.$config.renderUrl + `/embed/profile/${this.player.tag}` },
        { hid: 'og:image:alt', property: 'og:image:alt', content: `${this.player.name} Brawl Stars Profile share image` },
        { hid: 'og:image:type', property: 'og:image:type', content: 'image/png' },
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
      battleTotals: {} as BattleTotalRow,
    }
  },
  computed: {
    totalBattles(): number {
      return this.battleTotals.picks || this.player.battles.length
    },
    enableClickerStats(): boolean {
      // do not send queries to backend if user has no battle history in database
      return this.battleTotals.picks != undefined && this.battleTotals.picks > 25
    },
    topBrawlerId(): string {
      const brawlerIds = [...Object.keys(this.player.brawlers)]
      return brawlerIds[0]
    },
    ...mapState({
      player: (state: any) => state.player,
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

    const tagRegex = RegExp(store.state.tagPattern)

    if (!tagRegex.test(tag)) {
      return false
    }

    let lastError
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await store.dispatch('loadPlayer', tag)
        return true
      } catch (error) {
        if (error.response !== undefined && error.response.status === 404) {
          return false
        }
        lastError = error
      }
    }

    throw lastError
  },
  mounted() {
    setTimeout(() => this.refreshTimer(), 15 * 1000)
  },
  fetchDelay: 0,
  async fetch() {
    const battleData = await this.$clicker.query('player.winrates.total',
      'battle',
      [],
      ['picks', 'battle_victory', 'battle_trophy_change'],
      {
        ...this.$clicker.defaultSlicesRaw('battle'),
        player_tag: [this.player.tag],
      },
      { sort: { picks: 'desc' }, cache: 60 })

    if (battleData.data[0].picks != undefined) {
      this.battleTotals = battleData.data[0]
    }
  },
  methods: {
    async refreshTimer() {
      this.refreshSecondsLeft -= 15
      if (this.refreshSecondsLeft <= 0) {
        await this.refresh()
        await this.$fetch()
      }
      setTimeout(() => this.refreshTimer(), 15 * 1000)
    },
    async refresh() {
      this.refreshSecondsLeft = 180
      await this.refreshPlayer()
    },
    trackScroll(visible, entry, section) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'profile',
          'event_label': section,
        })
      }
    },
    ...mapActions({
      refreshPlayer: 'refreshPlayer',
    }),
  },
})
</script>
