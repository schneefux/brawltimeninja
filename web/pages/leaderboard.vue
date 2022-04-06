<template>
  <b-page :title="$t('leaderboard.player.metric.title', { metric: $t('metric.' + metric) })">
    <p>{{ $t('leaderboard.player.metric.description', { metric: $t('metric.' + metric) }) }}</p>

    <ad
      ad-slot="4579727583"
      first
    ></ad>

    <div class="mt-4 flex flex-wrap gap-x-2 gap-y-4 justify-center">
      <b-button
        v-for="metric in metrics"
        :key="metric"
        :to="localePath(`/leaderboard/${metric}`)"
        primary
        sm
      >
        {{ $t('metric.' + metric) }}
      </b-button>
    </div>

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

export default defineComponent({
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

    const metrics = [
      'hours',
      'trophies',
      'victories',
      'soloVictories',
      'duoVictories',
    ]

    return {
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
