<template>
  <b-page :title="$t('player.meta.title', { name: player.name })">
    <ad
      ad-slot="9429125351"
      first
    ></ad>

    <b-split-dashboard class="mt-8 lg:mt-0">
      <div
        slot="aside"
        class="lg:h-screen lg:flex lg:flex-col lg:py-8 lg:mt-8"
      >
        <player-aside
          :player="player"
          v-observe-visibility="{
            callback: makeVisibilityCallback('aside'),
            once: true,
          }"
          class="!h-auto"
        ></player-aside>

        <b-scroll-spy
          :sections="sections"
          nav-class="top-14 lg:top-0"
          toc-class="hidden lg:block"
          class="lg:mt-8 lg:overflow-y-auto"
        ></b-scroll-spy>
      </div>

      <b-page-section
        ref="timeSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('hours'),
          once: true,
        }"
        :title="$t('player.time-statistics')"
        lazy
      >
        <player-time-statistics
          :player="player"
          @interact="trackInteraction('hours')"
        ></player-time-statistics>
      </b-page-section>

      <b-page-section
        ref="trophySection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('trophies'),
          once: true,
        }"
        :title="$t('player.trophy-statistics')"
        lazy
      >
        <player-trophy-statistics
          :player="player"
          :player-totals="playerTotals"
          :enable-klicker-stats="enableKlickerStats"
          @interact="trackInteraction('trophies')"
        ></player-trophy-statistics>
      </b-page-section>

      <b-page-section
        v-observe-visibility="{
          callback: makeVisibilityCallback('info'),
          once: true,
        }"
        :title="$t('info')"
      >
        <p class="prose dark:prose-invert max-w-none">
          {{ $t('player.disclaimer', { battles: playerTotals != undefined ? playerTotals.picks : 25 }) }}
        </p>

        <install-card
          class="mt-8 max-w-md"
        ></install-card>
      </b-page-section>

      <ad
        ad-slot="3933066188"
        lazy
      ></ad>

      <b-page-section
        ref="brawlersSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('brawlers'),
          once: true,
        }"
        :title="$tc('brawler', 2)"
        lazy
      >
        <p class="prose dark:prose-invert">
          {{ $t('player.brawlers.description') }}
        </p>

        <player-brawlers
          :player="player"
          :enable-klicker-stats="enableKlickerStats"
          class="mt-4"
          @interact="trackInteraction('brawlers')"
        ></player-brawlers>
      </b-page-section>

      <b-page-section
        ref="quizSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('quiz'),
          once: true,
        }"
        :title="$t('player.quiz.title')"
        lazy
      >
        <client-only>
          <quiz-card
            @interact="trackInteraction('quiz')"
          ></quiz-card>
        </client-only>
      </b-page-section>

      <ad
        ad-slot="4129048243"
        lazy
      ></ad>

      <b-page-section
        v-if="playerTotals != undefined && playerTotals.picks > 0"
        ref="battlesSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('battles'),
          once: true,
        }"
        :title="$tc('battle-log', 1)"
        lazy
      >
        <p class="mt-4 prose dark:prose-invert w-full">
          {{ $t('player.battle-log.description') }}
          {{ $t('player.updating-in', { minutes: Math.floor(refreshSecondsLeft / 60), seconds: refreshSecondsLeft % 60 }) }}
        </p>

        <b-button
          class="mt-2"
          xs
          primary
          @click="refresh"
        >
          {{ $t('action.refresh') }}
        </b-button>

        <player-battles
          :player="player"
          class="mt-8"
          @interact="trackInteraction('battles')"
        ></player-battles>
      </b-page-section>

      <b-page-section
        ref="modesSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('gamemodes'),
          once: true,
        }"
        :title="$tc('mode', 2)"
        lazy
      >
        <p class="prose dark:prose-invert">
          {{ $t('player.modes.description') }}
        </p>

        <player-mode-winrates
          :player="player"
          :battles="player.battles"
          :enable-klicker-stats="enableKlickerStats"
          class="mt-4"
          @interact="trackInteraction('gamemodes')"
        ></player-mode-winrates>
      </b-page-section>

      <b-page-section
        ref="recordsSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('records'),
          once: true,
        }"
        :title="$t('player.records.title')"
        lazy
      >
        <p class="mt-4 prose dark:prose-invert w-full">
          {{ $t('player.records.description') }}
        </p>

        <player-percentiles
          :player="player"
          class="mt-8"
          @interact="trackInteraction('records')"
        ></player-percentiles>
      </b-page-section>
    </b-split-dashboard>

    <ad
      ad-slot="1752268168"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, useContext, useMeta, useRoute, useStore } from '@nuxtjs/composition-api'
import { ObserveVisibility } from 'vue-observe-visibility'
import { Player } from '~/model/Brawlstars'
import { PlayerTotals } from '~/store'
import { useTrackScroll } from '~/composables/gtag'
import { BSplitDashboard, BScrollSpy, BPageSection } from '@schneefux/klicker/components'
import { tagPattern } from '~/lib/util'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BSplitDashboard,
    BScrollSpy,
  },
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

    const { makeVisibilityCallback, trackInteraction } = useTrackScroll('profile')

    const sectionRefs = {
      timeSection: ref<InstanceType<typeof BPageSection>>(),
      trophySection: ref<InstanceType<typeof BPageSection>>(),
      quizSection: ref<InstanceType<typeof BPageSection>>(),
      recordsSection: ref<InstanceType<typeof BPageSection>>(),
      battlesSection: ref<InstanceType<typeof BPageSection>>(),
      modesSection: ref<InstanceType<typeof BPageSection>>(),
      brawlersSection: ref<InstanceType<typeof BPageSection>>(),
    }

    const sections = computed(() => [{
      id: 'time',
      title: i18n.t('player.time-statistics'),
      element: sectionRefs.timeSection.value,
    }, {
      id: 'trophy',
      title: i18n.t('player.trophy-statistics'),
      element: sectionRefs.trophySection.value,
    }, {
      id: 'brawlers',
      title: i18n.tc('brawler', 2),
      element: sectionRefs.brawlersSection.value,
    }, {
      id: 'quiz',
      title: i18n.t('player.quiz.title'),
      element: sectionRefs.quizSection.value,
    }, {
      id: 'battles',
      title: i18n.t('battle-log'),
      element: sectionRefs.battlesSection.value,
    }, {
      id: 'modes',
      title: i18n.tc('mode', 2),
      element: sectionRefs.modesSection.value,
    }, {
      id: 'records',
      title: i18n.t('player.records.title'),
      element: sectionRefs.recordsSection.value,
    }])

    return {
      refreshSecondsLeft,
      refresh,
      enableKlickerStats,
      player,
      playerTotals,
      makeVisibilityCallback,
      trackInteraction,
      sections,
      ...sectionRefs,
    }
  },
  middleware: ['cached'],
  async validate({ params, redirect }) {
    const tag = params.tag.toUpperCase()
    if (tag != params.tag) {
      // fuck Bing for lowercasing all URLs
      redirect(`/profile/${tag}`)
      return false
    }

    return tagPattern.test(tag)
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
