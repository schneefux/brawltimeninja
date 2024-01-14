<template>
  <b-page :title="$t('leaderboard.player.metric.title', { metric: $t('metric.' + metric) })">
    <p id="description">{{ $t('leaderboard.player.metric.description', { metric: $t('metric.' + metric) }) }}</p>

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

    <div id="leaderboard" class="flex justify-center mt-8">
      <router-view></router-view>
    </div>

    <ad
      ad-slot="5140154307"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { useCacheHeaders, useMeta } from '~/composables/compat'
import { defineComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useRouteParams } from '~/composables/route-params'

export default defineComponent({
  setup() {
    const i18n = useI18n()

    const route = useRoute()
    const routeParams = useRouteParams()
    const metric = computed(() => {
      if (route.path.endsWith('/trophies')) {
        return 'trophies'
      }
      return routeParams.value!.metric as string
    })

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('leaderboard.meta.title', { metric: i18n.t('metric.' + metric.value) }),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('leaderboard.meta.description', { metric: i18n.t('metric.' + metric.value) }) },
      ]
    }))

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
})
</script>
