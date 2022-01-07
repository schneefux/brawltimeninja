<template>
  <c-canvas-renderer
    :report="report"
    class="sharepic"
  >
    <template v-slot:dimensions="data">
      <d-brawler v-bind="data"></d-brawler>
      <d-team v-bind="data"></d-team>
      <d-mode v-bind="data"></d-mode>
      <d-map v-bind="data"></d-map>
      <d-season v-bind="data"></d-season>
      <d-player v-bind="data"></d-player>
    </template>

    <template v-slot:[`measurements.brawler`]="data">
      <m-brawler v-bind="data"></m-brawler>
    </template>
  </c-canvas-renderer>
</template>

<script lang='ts'>
import { defineComponent, computed, useRoute } from "@nuxtjs/composition-api"
import { CCanvas, CCanvasRenderer, CQuery, VTable, VTestInfo, VBarplot, VLineplot, VRoll, VDashboard } from '~/klicker/components'
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import DTeam from '@/components/klicker/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import DMode from '@/components/klicker/d-mode.vue'
import DMap from '@/components/klicker/d-map.vue'
import DSeason from '@/components/klicker/d-season.vue'
import DPlayer from '@/components/klicker/d-player.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import { MetaInfo } from 'vue-meta'
import { Report } from "~/klicker"

export default defineComponent({
  components: {
    CCanvas,
    CCanvasRenderer,
    CQuery,
    VTable,
    VTestInfo,
    VBarplot,
    VLineplot,
    VRoll,
    VDashboard,
    DBrawler,
    BrawlerLink, // dependency of DBrawler
    DTeam,
    BrawlerTeam, // dependency of DTeam
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

    const report = computed<Report>(() =>
      JSON.parse(Buffer.from(decodeURIComponent(route.value.query['conf'] as string), 'base64').toString()))

    return {
      report,
    }
  }
})
</script>
