<template>
  <c-canvas-renderer
    :widgets="widgets"
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
import SModeMap from '@/components/klicker/s-mode-map.vue'
import SCompetitionMaps from '@/components/klicker/s-competition-maps.vue'
import SAlly from '@/components/klicker/s-ally.vue'
import SSeason from '@/components/klicker/s-season.vue'
import SPowerplay from '@/components/klicker/s-powerplay.vue'
import STrophies from '@/components/klicker/s-trophies.vue'
import SWithStarpower from '@/components/klicker/s-with-starpower.vue'
import SWithGadget from '@/components/klicker/s-with-gadget.vue'
import SBrawler from '@/components/klicker/s-brawler.vue'
import VGini from '@/components/klicker/v-gini.vue'
import VLastUpdate from '@/components/klicker/v-last-update.vue'
import VMoe from '@/components/klicker/v-moe.vue'
import VSampleSize from '@/components/klicker/v-sample-size.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import SPlayerName from '@/components/klicker/s-player-name.vue'
import SPlayerTag from '@/components/klicker/s-player-tag.vue'
import { useLocalStorage } from 'vue-composable'
import { Widget } from '~/klicker/components/c-canvas.vue'
import { MetaInfo } from 'vue-meta'

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
    VGini,
    VLastUpdate,
    VMoe,
    VSampleSize,
    MBrawler,
  },
  head(): MetaInfo {
    // block all requests except to subdomains (including ads/analytics)
    const allowedOrigins = [this.$config.clickerUrl, this.$config.mediaUrl, this.$config.cubeUrl, this.$config.apiUrl]
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
    // TODO runs only on client
    const widgets = computed<Widget[]>(() => {
      if (process.client) {
        return JSON.parse(atob(decodeURIComponent(route.value.query['conf'] as string)))
      } else {
        return []
      }
    })

    return {
      widgets,
    }
  }
})
</script>
