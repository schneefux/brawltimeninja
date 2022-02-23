<template>
  <b-page :title="$t('leaderboard.player.metric.title', { metric: $t('metric.' + metric) })">
    <p>{{ $t('leaderboard.player.metric.description', { metric: $t('metric.' + metric) }) }}</p>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-105"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4579727583"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="ad-section"
      ></adsense>
    </client-only>

    <b-horizontal-scroller
      class="mt-3"
      expand-on-desktop
    >
      <b-button
        v-for="metric in metrics"
        :key="metric"
        :to="localePath(`/leaderboard/${metric}`)"
        class="mt-2 mr-2 whitespace-nowrap"
        primary
        sm
      >
        {{ $t('metric.' + metric) }}
      </b-button>
    </b-horizontal-scroller>

    <div class="flex justify-center mt-8">
      <nuxt-child></nuxt-child>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        id="ezoic-pub-ad-placeholder-106"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="5140154307"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="ad-section"
      />
    </client-only>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, useMeta, useContext, useRoute, computed, useStore, watch } from '@nuxtjs/composition-api'
import { getSeasonEnd } from '@/lib/util'
import { BHorizontalScroller } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BHorizontalScroller,
  },
  head: {},
  setup() {
    const { i18n } = useContext()

    const route = useRoute()
    const metric = computed(() => {
      if (route.value.fullPath.endsWith('/trophies')) {
        return 'trophies'
      }
      return route.value.params.metric as string
    })

    useMeta(() => {
      const description = i18n.tc('leaderboard.meta.description', 1, { metric: i18n.t('metric.' + metric.value) })
      return {
        title: i18n.tc('leaderboard.meta.title', 1, { metric: i18n.t('metric.' + metric.value) }),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })

    const currentSeason = getSeasonEnd(new Date()).toISOString().slice(0, 10)

    const metrics = [
      'hours',
      'trophies',
      'victories',
      'soloVictories',
      'duoVictories',
    ]

    const store = useStore<any>()
    const isApp = computed(() => store.state.isApp as boolean)

    return {
      currentSeason,
      metric,
      metrics,
      isApp,
    }
  },
  meta: {
    title: 'Leaderboard',
    screen: 'profile',
  },
  middleware: ['cached'],
})
</script>
