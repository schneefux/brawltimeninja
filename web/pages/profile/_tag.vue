<template>
  <!-- FIXME on route transition, playerTag becomes undefined (Vue bug) -->
  <split-page
    v-if="playerTag != undefined"
    :title="$t('player.meta.title', { name: player?.name ?? '#' + playerTag })"
  >
    <template v-slot:aside-left>
      <b-scroll-spy
        id="sidenav"
        :sections="sections"
        toc-class="hidden lg:block"
        nav-class="top-14"
      ></b-scroll-spy>
    </template>

    <b-page-section
      id="profile"
      ref="profileSection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('aside'),
        once: true,
      }"
    >
      <div class="flex flex-wrap gap-8 items-center">
        <b-shimmer
          v-if="player == undefined"
          height-px="512"
          class="flex-auto"
          loading
        ></b-shimmer>
        <player-aside
          v-else
          :player="player"
          :player-extra="playerExtra ?? undefined"
          class="flex-auto max-w-md"
        ></player-aside>

        <ad instream plain lazy></ad>
      </div>
    </b-page-section>

    <b-page-section
      id="time"
      ref="timeSection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('hours'),
        once: true,
      }"
      lazy
    >
      <player-time-statistics
        :player="player"
        @interact="trackInteraction('hours')"
      ></player-time-statistics>
    </b-page-section>

    <b-page-section
      id="info"
      v-observe-visibility="{
        callback: makeVisibilityCallback('info'),
        once: true,
      }"
      :title="$t('info')"
    >
      <p class="prose dark:prose-invert max-w-none">
        {{ $t('player.disclaimer', { battles: playerTotals?.picks ?? '…' }) }}
      </p>

      <install-card
        class="mt-8 max-w-md"
      ></install-card>
      <review-card
        v-if="player != undefined && playerTotals != undefined"
        class="mt-8 max-w-md"
      ></review-card>
      <youtube-card
        class="mt-8 max-w-md"
      ></youtube-card>
    </b-page-section>

    <b-page-section
      id="sharepic"
      ref="sharepicSection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('sharepic'),
        once: true,
      }"
      :title="$t('player.sharepic.title')"
      lazy
    >
      <div class="flex flex-wrap justify-between items-center gap-8">
        <player-sharepic-editor
          :player-tag="playerTag"
          :player="player"
          @interact="trackInteraction('sharepic')"
        ></player-sharepic-editor>

        <div>
          <affiliate-card></affiliate-card>
        </div>
      </div>
    </b-page-section>

    <b-page-section
      id="trophy"
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
        :player-tag="playerTag"
        :player-totals="playerTotals"
        @interact="trackInteraction('trophies')"
      ></player-trophy-statistics>
    </b-page-section>

    <ad lazy></ad>

    <b-page-section
      id="brawlers"
      ref="brawlersSection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('brawlers'),
        once: true,
      }"
      :title="$t('brawler', 2)"
      lazy
    >
      <p class="prose dark:prose-invert">
        {{ $t('player.brawlers.description') }}
      </p>

      <b-shimmer
        v-if="player == undefined"
        height-px="456"
        class="mt-4"
        loading
      ></b-shimmer>
      <player-brawlers
        v-else
        :player="player"
        :player-extra="playerExtra ?? undefined"
        class="mt-4"
        @interact="trackInteraction('brawlers')"
      ></player-brawlers>
    </b-page-section>

    <ad lazy></ad>

    <template
      v-if="player == undefined || player.battles.length > 0"
    >
      <b-page-section
        id="battles"
        ref="battlesSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('battles'),
          once: true,
        }"
        :title="$t('battle-log', 1)"
        lazy
      >
        <p class="mt-4 prose dark:prose-invert w-full">
          {{ $t('player.battle-log.description') }}
        </p>

        <b-shimmer
          v-if="player == undefined"
          height-px="318"
          class="mt-8"
          loading
        ></b-shimmer>
        <battles-list
          v-else
          :battles="player.battles"
          :highlight-tags="[playerTag]"
          class="mt-8"
          @interact="trackInteraction('battles')"
        ></battles-list>
      </b-page-section>

      <ad lazy></ad>
    </template>

    <b-page-section
      id="modes"
      ref="modesSection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('gamemodes'),
        once: true,
      }"
      :title="$t('mode', 2)"
      lazy
    >
      <p class="prose dark:prose-invert">
        {{ $t('player.modes.description') }}
      </p>

      <b-shimmer
        v-if="player == undefined"
        height-px="288"
        class="mt-4"
        loading
      ></b-shimmer>
      <player-mode-winrates
        v-else
        :player="player"
        :battles="player.battles"
        class="mt-4"
        @interact="trackInteraction('gamemodes')"
      ></player-mode-winrates>
    </b-page-section>

    <ad lazy></ad>

    <b-page-section
      id="progression"
      ref="progressionSection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('progression'),
        once: true,
      }"
      :title="$t('player.progression.title')"
      lazy
    >
      <p class="mt-4 prose dark:prose-invert w-full">
        {{ $t('player.progression.description') }}
      </p>

      <b-shimmer
        v-if="player == undefined"
        class="mt-8"
        height-px="112"
        loading
      ></b-shimmer>
      <player-progression
        v-else
        :player="player"
        class="mt-8"
        @interact="trackInteraction('progression')"
      ></player-progression>
    </b-page-section>

    <ad lazy></ad>

    <b-page-section
      id="records"
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

      <b-shimmer
        v-if="player == undefined"
        class="mt-8"
        height-px="112"
        loading
      ></b-shimmer>
      <player-percentiles
        v-else
        :player="player"
        class="mt-8"
        @interact="trackInteraction('records')"
      ></player-percentiles>
    </b-page-section>

    <ad lazy></ad>

    <b-page-section
      id="quiz"
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

    <b-page-section
      v-if="player != undefined && modeForSurvey != undefined"
      id="survey"
      ref="surveySection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('survey'),
        once: true,
      }"
      :title="$t('player.survey.title')"
      lazy
    >
      <p class="mt-4 prose dark:prose-invert w-full">
        {{ $t('player.survey.description') }}
      </p>

      <client-only>
        <survey-card
          :player="player"
          :mode="modeForSurvey"
          class="mt-8"
          @interact="trackInteraction('survey')"
        ></survey-card>
      </client-only>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { computed, defineComponent, useTemplateRef } from 'vue'
import { useApi, useAsync, useCacheHeaders, useMeta, useSelfOrigin } from '~/composables/compat'
import { ObserveVisibility } from 'vue-observe-visibility'
import { useTrackScroll } from '~/composables/gtag'
import { BScrollSpy, BPageSection, BShimmer } from '@schneefux/klicker/components'
import { PlayerTotals, useBrawlstarsStore } from '~/stores/brawlstars'
import { useI18n } from 'vue-i18n'
import { useLoadAndValidatePlayer, usePlayerRender } from '~/composables/player'
import { useKlicker } from '@schneefux/klicker/composables'
import { tagToId } from '~/lib/util'
import { useRouteParams } from '~/composables/route-params'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BPageSection,
    BScrollSpy,
    BShimmer,
  },
  async setup() {
    const i18n = useI18n()
    const routeParams = useRouteParams()
    const klicker = useKlicker()

    const store = useBrawlstarsStore()
    const player = computed(() => store.player)

    const origin = useSelfOrigin()
    const playerTag = computed(() => routeParams.value!.tag as string)
    const playerRenderUrl = usePlayerRender(playerTag)

    useCacheHeaders()
    useMeta(() => {
      if (player.value == undefined) {
        return {}
      }

      const name = player.value.name
      return {
        title: i18n.t('player.meta.title', { name }),
        meta: [
          { hid: 'description', name: 'description', content: i18n.t('player.meta.description', { name: player.value.name }) },
          { hid: 'og:image', property: 'og:image', content: origin + playerRenderUrl.value },
          { hid: 'og:image:alt', property: 'og:image:alt', content: `${name} Brawl Stars Profile share image` },
          { hid: 'og:image:type', property: 'og:image:type', content: 'image/png' },
          { hid: 'og:image:width', property: 'og:image:width', content: '1200' },
          { hid: 'og:image:height', property: 'og:image:height', content: '630' },
        ]
      }
    })

    const { makeVisibilityCallback, trackInteraction } = useTrackScroll('profile')

    const sectionRefs = {
      profileSection: useTemplateRef<InstanceType<typeof BPageSection>>('profileSection'),
      timeSection: useTemplateRef<InstanceType<typeof BPageSection>>('timeSection'),
      trophySection: useTemplateRef<InstanceType<typeof BPageSection>>('trophySection'),
      sharepicSection: useTemplateRef<InstanceType<typeof BPageSection>>('sharepicSection'),
      quizSection: useTemplateRef<InstanceType<typeof BPageSection>>('quizSection'),
      recordsSection: useTemplateRef<InstanceType<typeof BPageSection>>('recordsSection'),
      battlesSection: useTemplateRef<InstanceType<typeof BPageSection>>('battlesSection'),
      surveySection: useTemplateRef<InstanceType<typeof BPageSection>>('surveySection'),
      modesSection: useTemplateRef<InstanceType<typeof BPageSection>>('modesSection'),
      brawlersSection: useTemplateRef<InstanceType<typeof BPageSection>>('brawlersSection'),
      progressionSection: useTemplateRef<InstanceType<typeof BPageSection>>('progressSection'),
    }

    const sections = computed(() => [{
      id: 'profile',
      title: i18n.t('nav.Profile'),
      element: sectionRefs.profileSection.value?.$el,
    }, {
      id: 'time',
      title: i18n.t('player.time-statistics'),
      element: sectionRefs.timeSection.value?.$el,
    }, {
      id: 'sharepic',
      title: i18n.t('player.sharepic.title'),
      element: sectionRefs.sharepicSection.value?.$el,
    }, {
      id: 'trophy',
      title: i18n.t('player.trophy-statistics'),
      element: sectionRefs.trophySection.value?.$el,
    }, {
      id: 'brawlers',
      title: i18n.t('brawler', 2),
      element: sectionRefs.brawlersSection.value?.$el,
    }, {
      id: 'battles',
      title: i18n.t('battle-log'),
      element: sectionRefs.battlesSection.value?.$el,
    }, {
      id: 'modes',
      title: i18n.t('mode', 2),
      element: sectionRefs.modesSection.value?.$el,
    }, {
      id: 'progression',
      title: i18n.t('player.progression.title'),
      element: sectionRefs.progressionSection.value?.$el,
    }, {
      id: 'records',
      title: i18n.t('player.records.title'),
      element: sectionRefs.recordsSection.value?.$el,
    }, {
      id: 'quiz',
      title: i18n.t('player.quiz.title'),
      element: sectionRefs.quizSection.value?.$el,
    }, {
      id: 'survey',
      title: i18n.t('player.survey.title'),
      element: sectionRefs.surveySection.value?.$el,
    }])

    const playerTotalsFallback = computed(() => {
      if (player.value == undefined) {
        return undefined
      }

      // calculate player totals from battle log
      const picks = player.value.battles.length
      const trophyChanges = player.value.battles
        .map((battle) => battle.trophyChange)
        .filter((trophyChange): trophyChange is number => trophyChange != undefined)
      const trophyChange = trophyChanges.length > 0 ?
        trophyChanges.reduce((sum, t) => sum + t, 0) / trophyChanges.length : 0
      const winRate = player.value.battles.length > 0 ?
        player.value.battles.filter((battle) => battle.victory).length / player.value.battles.length : 0

      return {
        picks,
        trophyChange,
        winRate,
      }
    })

    const playerTotalsKlicker = useAsync(async () => {
      try {
        const response = await klicker.query({
          cubeId: 'battle',
          dimensionsIds: [],
          metricsIds: ['picks', 'winRate', 'trophyChange'],
          slices: {
            playerId: [tagToId(playerTag.value)],
          },
          sortId: 'picks',
        })
        const totals = response.data[0].metricsRaw as unknown as PlayerTotals
        if (totals.picks == 0) {
          return null
        }
        return totals
      } catch (err) {
        return null
      }
    }, computed(() => `player-totals-${playerTag.value}`))

    const playerTotals = computed(() => playerTotalsKlicker.value ?? playerTotalsFallback.value ?? undefined)

    const $api = useApi()
    const playerExtra = useAsync(async () => {
      try {
        return await $api.player.byTagExtra.query(playerTag.value) ?? null
      } catch (err) {
        return null
      }
    }, computed(() => `player-extra-${playerTag.value}`))

    const modeForSurvey = computed(() => {
      if (player.value == undefined || player.value.battles.length == 0) {
        return undefined
      }

      // last battle was within the last 7 days
      const lastBattle = player.value.battles[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (lastBattle == undefined || lastBattle.timestamp < weekAgo) {
        return undefined
      }

      // has unlocked ranked
      if (player.value.trophies < 1000 && !Object.values(player.value.brawlers).some(brawler => brawler.power >= 9)) {
        return undefined
      }

      // return most frequently played mode
      const modeCounts = player.value.battles.reduce((acc, battle) => {
        acc[battle.event.mode] = (acc[battle.event.mode] ?? 0) + 1
        return acc
      }, {} as Record<string, number>)

      return Object.entries(modeCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([mode]) => mode)[0]
    })

    await useLoadAndValidatePlayer('/profile/')

    return {
      player,
      playerTag,
      playerTotals,
      playerExtra,
      makeVisibilityCallback,
      trackInteraction,
      sections,
      modeForSurvey,
    }
  },
})
</script>
