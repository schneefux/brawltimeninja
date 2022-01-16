<template>
  <page-dashboard
    :title="$t('dashboard-designer.title')"
  >
    <div slot="dashboard">
      <c-grid
        v-model="grid"
        :default-query="defaultQuery"
      >
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
          <v-sample-size v-bind="data"></v-sample-size>
          <v-last-update v-bind="data"></v-last-update>
        </template>

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
      </c-grid>

      <div
        v-if="canSave"
        class="mt-2 grid grid-cols-[max-content,max-content] gap-x-2 gap-y-2 items-center"
      >
        <label :for="`${prefix}-editor`">
          {{ $t('action.editor-url') }}
        </label>
        <b-textbox
          :id="`${prefix}-editor`"
          :value="editorUrl"
          readonly
          dark
        ></b-textbox>

        <label :for="`${prefix}-viewer`">
          {{ $t('action.viewer-url') }}
        </label>
        <b-textbox
          :id="`${prefix}-viewer`"
          :value="viewerUrl"
          readonly
          dark
        ></b-textbox>
      </div>
      <div v-else>
        <p>Log in to share this report.</p>
        <login-button class="mt-2"></login-button>
      </div>
    </div>
  </page-dashboard>
</template>

<script lang='ts'>
import { defineComponent, computed, onMounted, useRoute } from "@nuxtjs/composition-api"
import { CGrid, BTextbox } from '~/klicker/components'
import { Grid, CubeQuery } from '~/klicker'
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
import MBrawler from '@/components/klicker/m-brawler.vue'
import SPlayerName from '@/components/klicker/s-player-name.vue'
import SPlayerTag from '@/components/klicker/s-player-tag.vue'
import { useStorage } from '~/klicker/composables'
import { getSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    BTextbox,
    CGrid,
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
    MBrawler,
    SPlayerName,
    SPlayerTag,
  },
  setup() {
    const { storage: grid, update, canSave } = useStorage<Grid>('grids', {
      id: undefined,
      title: 'New Dashboard',
      widgets: [],
    })

    const route = useRoute()
    onMounted(async () => {
      if (route.value.query['id'] != undefined) {
        await update(parseInt(route.value.query['id'] as string))
      }
    })

    const editorUrl = computed<string>(() => {
      if (process.client) {
        return window.location.href + '?id=' + grid.value.id
      } else {
        return ''
      }
    })
    const viewerUrl = computed<string>(() => {
      if (process.client) {
        return window.location.origin + '/embed/dashboard?id=' + grid.value.id
      } else {
        return ''
      }
    })

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)
    const defaultQuery: CubeQuery = {
      cubeId: 'battle',
      dimensionsIds: ['brawler'],
      measurementsIds: ['winRate'],
      slices: {
        season: [currentSeason.toISOString().slice(0, 10)],
        mode: [],
        map: [],
        trophyRangeGte: ['0'],
        powerplay: [],
      },
      sortId: 'winRate',
    }

    const prefix = Math.random().toString().slice(2)

    return {
      prefix,
      grid,
      canSave,
      editorUrl,
      viewerUrl,
      defaultQuery,
    }
  }
})
</script>
