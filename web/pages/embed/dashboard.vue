<template>
  <c-grid-renderer
    :grid="grid"
    class="sharepic"
  >
    <template v-slot:dimensions="data">
      <d-brawler v-bind="data"></d-brawler>
      <d-gear v-bind="data"></d-gear>
      <d-team v-bind="data"></d-team>
      <d-mode v-bind="data"></d-mode>
      <d-map v-bind="data"></d-map>
      <d-season v-bind="data"></d-season>
      <d-player v-bind="data"></d-player>
    </template>

    <template v-slot:[`metrics.brawler`]="data">
      <m-brawler v-bind="data"></m-brawler>
    </template>
  </c-grid-renderer>
</template>

<script lang='ts'>
import { defineComponent, useRoute, useAsync } from "@nuxtjs/composition-api"
import { CGridRenderer } from '@schneefux/klicker/components'
import DBrawler from '@/components/klicker/d-brawler.vue'
import DTeam from '@/components/klicker/d-team.vue'
import DMode from '@/components/klicker/d-mode.vue'
import DMap from '@/components/klicker/d-map.vue'
import DSeason from '@/components/klicker/d-season.vue'
import DPlayer from '@/components/klicker/d-player.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import { MetaInfo } from 'vue-meta'
import { Grid } from "@schneefux/klicker/types"
import useFeathers from "@schneefux/klicker/composables/feathers"

export default defineComponent({
  components: {
    CGridRenderer,
    DBrawler,
    DTeam,
    DMode,
    DMap,
    DSeason,
    DPlayer,
    MBrawler,
  },
  head(): MetaInfo {
    // block all requests except to subdomains (including ads/analytics)
    const allowedOrigins = [this.$config.mediaUrl, this.$config.cubeUrl, this.$config.apiUrl]
    return {
      meta: [ <any>{
        // FIXME remove any after https://github.com/nuxt/vue-meta/issues/575
        'http-equiv': 'Content-Security-Policy',
        content: `default-src 'self' 'unsafe-inline' 'unsafe-eval' ${allowedOrigins.join(' ')}`,
      } ]
    }
  },
  layout: 'empty',
  middleware: ['cached'],
  setup() {
    const route = useRoute()

    const { client } = useFeathers()
    const grid = useAsync<Grid>(() => client.service('grids').get(parseInt(route.value.query['id'] as string)))

    return {
      grid,
    }
  }
})
</script>
