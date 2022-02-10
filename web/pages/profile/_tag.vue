<template>
  <page>
    <client-only>
      <adsense
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9429125351"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="ad-section"
      />
      <div style="height: 300px;" class="adswrapper ad-section w-full" slot="placeholder"></div>
    </client-only>

    <page-section
      tracking-id="hours"
      tracking-page-id="profile"
    >
      <div class="w-full flex justify-between">
        <h1 class="text-3xl relative z-10">
          {{ $t('player.statistics-for') }}
          <span class="text-yellow-400">{{ player.name }}</span>
          <span
            v-if="player.tag == 'V8LLPPC'"
            class="align-top text-xs text-yellow-400 border-2 border-yellow-400 rounded-lg px-1 font-black"
          >DEV</span>
        </h1>

        <media-img
          :path="`/avatars/${player.icon.id}`"
          clazz="w-16 h-16 md:w-24 md:h-24"
          wrapper-class="flex-shrink-0"
        ></media-img>
      </div>
    </page-section>

    <page-section>
      <player-hype-stats
        :player="player"
        :player-totals="playerTotals"
        :enable-klicker-stats="enableKlickerStats"
      ></player-hype-stats>
    </page-section>

    <page-section>
      <div class="flex flex-wrap justify-center items-center">
        <experiment experiment-id="ieQ8BYYpS9Cwd7qcpBj8tQ">
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
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3933066188"
      />
    </client-only>

    <page-section :title="$t('player.records.title')">
      <p class="mt-4 prose dark:prose-invert w-full">
        {{ $t('player.records.description') }}
      </p>

      <player-lifetime
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'lifetime'),
          once: true,
        }"
        :player="player"
        class="mt-8"
      ></player-lifetime>

      <player-percentiles
        :player="player"
        class="mt-8"
      ></player-percentiles>
    </page-section>

    <page-section title="Info">
      <p class="prose dark:prose-invert max-w-none">
        {{ $t('player.disclaimer', { battles: playerTotals != undefined ? playerTotals.picks : 25 }) }}
      </p>
    </page-section>

    <page-section
      v-if="playerTotals != undefined && playerTotals.picks > 0"
      :title="$tc('battle-log', 1)"
    >
      <p class="mt-4 prose dark:prose-invert w-full">
        {{ $t('player.battle-log.description') }}
        {{ $t('player.updating-in', { minutes: Math.floor(refreshSecondsLeft / 60), seconds: refreshSecondsLeft % 60 }) }}
      </p>
      <b-button
        class="mt-2"
        sm
        primary
        @click="refresh"
      >
        {{ $t('action.refresh') }}
      </b-button>

      <player-battles-squares
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'battles'),
          once: true,
        }"
        :battles="player.battles"
        class="mt-8"
      ></player-battles-squares>

      <player-battles-stats
        :player-totals="playerTotals"
        class="mt-8"
      ></player-battles-stats>

      <player-battles
        :player="player"
        class="mt-8"
      ></player-battles>
    </page-section>

    <page-section>
      <install-card
        class="mx-auto"
      ></install-card>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4129048243"
      />
    </client-only>

    <page-section :title="$tc('mode', 2)">
      <p class="prose dark:prose-invert">
        {{ $t('player.modes.description') }}
      </p>

      <player-mode-winrates
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gamemodes'),
          once: true,
        }"
        :player="player"
        :battles="player.battles"
        :enable-klicker-stats="enableKlickerStats"
        class="mt-4"
      ></player-mode-winrates>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1752268168"
      />
    </client-only>

    <page-section :title="$tc('brawler', 2)">
      <p class="prose dark:prose-invert">
        {{ $t('player.brawlers.description') }}
      </p>

      <player-brawlers
        :player="player"
        :enable-klicker-stats="enableKlickerStats"
        class="mt-4"
      ></player-brawlers>
    </page-section>

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
import { computed, defineComponent, onMounted, onUnmounted, ref, useContext, useMeta, useRoute, useStore, wrapProperty } from '@nuxtjs/composition-api'
import { Player } from '~/model/Brawlstars'
import { PlayerTotals } from '~/store'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  head: {},
  setup() {
    const { i18n, $config, $sentry } = useContext()

    const route = useRoute()

    const enableKlickerStats = computed(() =>
      // do not send queries to backend if user has no battle history in database
      (playerTotals.value?.picks || 0) > 25
    )

    const timer = ref<undefined|number>()
    const refreshSecondsLeft = ref(180)
    const refreshTimer = async () => {
      refreshSecondsLeft.value -= 15
      if (refreshSecondsLeft.value <= 0) {
        await refresh()
      }
      timer.value = window.setTimeout(() => refreshTimer(), 15 * 1000)
    }
    const refresh = async () => {
      try {
        await store.dispatch('loadPlayer', route.value.params.tag)
      } catch (err: any) {
        if (err.response?.status != 404) {
          console.error(err)
          $sentry.captureException(err)
        }
      }
      refreshSecondsLeft.value = 180
    }

    onMounted(() => timer.value = window.setTimeout(() => refreshTimer(), 15 * 1000))
    onUnmounted(() => window.clearTimeout(timer.value))

    const store = useStore<any>()
    const player = computed(() => store.state.player as Player)
    const playerTotals = computed(() => store.state.playerTotals as PlayerTotals|undefined)

    const gtag = useGtag()
    const trackScroll = (visible, entry, section) => {
      if (visible) {
        gtag.event('scroll', {
          'event_category': 'profile',
          'event_label': section,
        })
      }
    }

    const isApp = computed(() => store.state.isApp as boolean)

    useMeta(() => {
      const description = i18n.t('player.meta.description', { name: player.value.name }) as string
      const name = player.value.name
      const tag = route.value.params.tag
      return {
        title: i18n.t('player.meta.title', { name }) as string,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
          { hid: 'og:image', property: 'og:image', content: $config.renderUrl + `/embed/profile/${tag}` },
          { hid: 'og:image:alt', property: 'og:image:alt', content: `${name} Brawl Stars Profile share image` },
          { hid: 'og:image:type', property: 'og:image:type', content: 'image/png' },
          // 2x the .sharepic size
          { hid: 'og:image:width', property: 'og:image:width', content: '1200' },
          { hid: 'og:image:height', property: 'og:image:height', content: '630' },
        ]
      }
    })

    return {
      refreshSecondsLeft,
      refresh,
      enableKlickerStats,
      trackScroll,
      isApp,
      player,
      playerTotals,
    }
  },
  meta: {
    title: 'Profile',
    screen: 'profile',
  },
  middleware: ['cached'],
  async validate({ store, params, redirect }) {
    const tag = params.tag.toUpperCase()
    if (tag != params.tag) {
      // fuck Bing for lowercasing all URLs
      redirect(`/profile/${tag}`)
      return false
    }

    return RegExp(store.state.tagPattern).test(tag)
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
  },
})
</script>
