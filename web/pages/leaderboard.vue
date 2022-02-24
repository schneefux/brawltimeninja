<template>
  <b-page :title="$t('leaderboard.player.metric.title', { metric: $t('metric.' + metric) })">
    <p>{{ $t('leaderboard.player.metric.description', { metric: $t('metric.' + metric) }) }}</p>

    <ad
      ad-slot="4579727583"
      first
    ></ad>

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

    <ad
      ad-slot="5140154307"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, useMeta, useContext, useRoute, computed } from '@nuxtjs/composition-api'
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

    return {
      currentSeason,
      metric,
      metrics,
    }
  },
  meta: {
    title: 'Leaderboard',
    screen: 'profile',
  },
  middleware: ['cached'],
})
</script>
