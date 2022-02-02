<template>
  <page-dashboard
    :title="$t('dashboard-designer.title')"
  >
    <c-grid
      v-model="grid"
      :default-query="defaultQuery"
      class="mt-8"
    >
      <template v-slot:totals="data">
        <v-sample-size
          v-bind="data"
          class="dashboard__cell"
          style="--columns: 2;"
        ></v-sample-size>
        <v-last-update
          v-bind="data"
          class="dashboard__cell"
          style="--columns: 2;"
        ></v-last-update>
      </template>

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
    </c-grid>

    <div
      v-if="canSave"
      class="mt-8 grid grid-cols-[max-content,max-content] gap-x-8 gap-y-4 items-center"
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
    <div v-else class="mt-8 flex flex-col gap-y-4">
      <p>Log in to share this report.</p>
      <login-button></login-button>
    </div>
  </page-dashboard>
</template>

<script lang='ts'>
import { defineComponent, computed, onMounted, useRoute } from "@nuxtjs/composition-api"
import { CGrid, BTextbox } from '@schneefux/klicker/components'
import { Grid, CubeQuery } from '@schneefux/klicker/types'
import DBrawler from '@/components/klicker/d-brawler.vue'
import DGear from '@/components/klicker/d-gear.vue'
import DTeam from '@/components/klicker/d-team.vue'
import DMode from '@/components/klicker/d-mode.vue'
import DMap from '@/components/klicker/d-map.vue'
import DSeason from '@/components/klicker/d-season.vue'
import DPlayer from '@/components/klicker/d-player.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import { useStorage } from '@schneefux/klicker/composables'
import { getSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    BTextbox,
    CGrid,
    DBrawler,
    DGear,
    DTeam,
    DMode,
    DMap,
    DSeason,
    DPlayer,
    MBrawler,
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
      metricsIds: ['winRate'],
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
