<template>
  <split-page :title="$t('leaderboard.player.metric.title', { metric: $t('metric.' + metric) })">
    <p id="description">{{ $t('leaderboard.player.metric.description', { metric: $t('metric.' + metric) }) }}</p>

    <div class="mt-4 flex flex-wrap gap-x-2 gap-y-4">
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

    <ad takeover></ad>

    <b-page-section id="leaderboard">
      <div class="flex justify-center">
        <router-view></router-view>
      </div>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { useCacheHeaders, useMeta } from '~/composables/compat'
import { defineComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useRouteParams } from '~/composables/route-params'
import { BButton, BPageSection } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BPageSection,
    BButton,
  },
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

<route>
{
  meta: {
    topBannerType: 'instream',
  },
}
</route>
