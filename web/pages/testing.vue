<template>
  <client-only>
    <div>
      <c-canvas-builder v-model="widgets">
        <template v-slot:slices="data">
          <s-season v-bind="data"></s-season>
          <s-mode-map v-bind="data"></s-mode-map>
          <s-competition-maps v-bind="data"></s-competition-maps>
          <s-brawler v-bind="data"></s-brawler>
          <s-ally v-bind="data"></s-ally>
          <s-powerplay v-bind="data"></s-powerplay>
          <s-trophies v-bind="data"></s-trophies>
          <s-with-starpower v-bind="data"></s-with-starpower>
          <s-with-gadget v-bind="data"></s-with-gadget>
          <s-player-name v-bind="data"></s-player-name>
          <s-player-tag v-bind="data"></s-player-tag>
        </template>

        <template v-slot:totals="data">
          <v-sample-size
            v-bind="data"
            :card="true"
          ></v-sample-size>
          <v-last-update
            v-bind="data"
            :card="true"
          ></v-last-update>
        </template>
      </c-canvas-builder>

      <share-render-button
        :embed-url="embedUrl"
        secondary
        sm
        class="mx-2 my-3"
      ></share-render-button>

      <c-canvas :widgets="widgets">
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
      </c-canvas>
    </div>
  </client-only>
</template>

<script lang='ts'>
import { defineComponent, computed } from "@nuxtjs/composition-api"
import { CCanvas, CCanvasBuilder, CQuery, VTable, VTestInfo, VBarplot, VLineplot, VRoll, VDashboard } from '~/klicker/components'
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

export default defineComponent({
  components: {
    CCanvas,
    CCanvasBuilder,
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
    SModeMap,
    SCompetitionMaps,
    SAlly,
    SSeason,
    SPowerplay,
    STrophies,
    SWithStarpower,
    SWithGadget,
    SBrawler,
    VGini,
    VLastUpdate,
    VMoe,
    VSampleSize,
    MBrawler,
    SPlayerName,
    SPlayerTag,
  },
  setup() {
    // TODO run only on client
    const { storage: widgets } = useLocalStorage<Widget[]>('canvas', [], true)

    const embedUrl = computed(() => {
      if (process.client) {
        return `/embed/canvas?conf=` + encodeURIComponent(btoa(JSON.stringify(widgets.value)))
      } else {
        return ''
      }
    })

    return {
      widgets,
      embedUrl,
    }
  }
})
</script>
