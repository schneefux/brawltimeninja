<template>
  <b-page :title="$t('report-designer.title')" no-container>
    <c-canvas
      v-model="report"
      :default-query="defaultQuery"
      class="mt-8"
    >
      <template v-slot:totals="data">
        <c-dashboard-cell :columns="2">
          <v-sample-size v-bind="data"></v-sample-size>
        </c-dashboard-cell>
        <c-dashboard-cell :columns="2">
          <v-last-update v-bind="data"></v-last-update>
        </c-dashboard-cell>
      </template>
    </c-canvas>

    <div
      v-if="canSave"
      class="mt-8 grid grid-cols-[max-content,max-content] gap-x-4 gap-y-8 items-center"
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
    <div v-else class="mt-8 flex flex-col gap-y-4">
      <p>Log in to share this report.</p>
      <login-button></login-button>
    </div>
  </b-page>
</template>

<script lang='ts'>
import { defineComponent, computed, onMounted, useRoute } from "@nuxtjs/composition-api"
import { CCanvas, BTextbox, CDashboardCell } from '@schneefux/klicker/components'
import { Report, CubeQuery } from '@schneefux/klicker/types'
import { useStorage } from '@schneefux/klicker/composables'
import { formatClickhouseDate, getMonthSeasonEnd, getSeasonEnd } from '~/lib/util'
import { useUniqueId } from '@schneefux/klicker/composables'

export default defineComponent({
  components: {
    CDashboardCell,
    BTextbox,
    CCanvas,
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

    const defaultQuery: CubeQuery = {
      cubeId: 'battle',
      dimensionsIds: ['brawler'],
      metricsIds: ['winRate'],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
        mode: [],
        map: [],
        trophyRangeGte: ['0'],
        powerplay: [],
      },
      sortId: 'winRate',
    }

    const { id: prefix } = useUniqueId()

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
