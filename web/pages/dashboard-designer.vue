<template>
  <page-dashboard
    :title="$t('dashboard-designer.title')"
  >
    <div slot="dashboard">
      <c-grid
        v-model="grid"
        :default-query="defaultQuery"
      >
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
import { CGrid, BTextbox } from 'klicker/components'
import { Grid, CubeQuery } from 'klicker/types'
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import DTeam from '@/components/klicker/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import DMode from '@/components/klicker/d-mode.vue'
import DMap from '@/components/klicker/d-map.vue'
import DSeason from '@/components/klicker/d-season.vue'
import DPlayer from '@/components/klicker/d-player.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import { useStorage } from 'klicker/composables'
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
