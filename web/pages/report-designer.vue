<template>
  <page-dashboard :title="$t('report-designer.title')">
    <div slot="dashboard">
      <c-canvas
        v-model="report"
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
      </c-canvas>

      <div
        v-if="canSave"
        class="mt-2 grid grid-cols-[max-content,max-content] gap-x-2 gap-y-2 items-center"
      >
        <template v-if="report.id != undefined">
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

          <share-render-button
            :embed-url="embedUrl"
            :button-text="$t('action.download-snapshot')"
            secondary
            sm
          ></share-render-button>
        </template>
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
import { CCanvas, BTextbox } from 'klicker/components'
import { Report, CubeQuery } from 'klicker/types'
import { useStorage } from 'klicker/composables'
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import DTeam from '@/components/klicker/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import DMode from '@/components/klicker/d-mode.vue'
import DMap from '@/components/klicker/d-map.vue'
import DSeason from '@/components/klicker/d-season.vue'
import DPlayer from '@/components/klicker/d-player.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import { getSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    BTextbox,
    CCanvas,
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
    const { storage: report, update, canSave } = useStorage<Report>('reports', {
      id: undefined,
      title: 'New Report',
      width: 1200,
      height: 630,
      widgets: [],
    })

    const route = useRoute()
    onMounted(async () => {
      if (route.value.query['id'] != undefined) {
        await update(parseInt(route.value.query['id'] as string))
      }
    })

    const embedUrl = computed<string>(() => {
      if (report.value.id != undefined) {
        return '/embed/report?id=' + report.value.id + '&t=' + report.value.updated_at
      } else {
        return ''
      }
    })
    const editorUrl = computed<string>(() => {
      if (process.client && report.value.id != undefined) {
        return window.location.href.replace(location.search, '') + '?id=' + report.value.id
      } else {
        return ''
      }
    })
    const viewerUrl = computed<string>(() => {
      if (process.client && embedUrl.value != undefined) {
        return window.location.origin + embedUrl.value
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
      report,
      canSave,
      embedUrl,
      editorUrl,
      viewerUrl,
      defaultQuery,
    }
  }
})
</script>
