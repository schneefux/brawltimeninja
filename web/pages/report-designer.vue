<template>
  <b-page :title="$t('report-designer.title')" no-container>
    <c-canvas
      v-model="report"
      :default-query="defaultQuery"
      class="mt-8"
    >
      <template v-slot:totals="data">
        <b-dashboard-cell :columns="2">
          <v-sample-size v-bind="data"></v-sample-size>
        </b-dashboard-cell>
        <b-dashboard-cell :columns="2">
          <v-last-update v-bind="data"></v-last-update>
        </b-dashboard-cell>
      </template>
    </c-canvas>

    <div
      v-if="canSave"
      class="mt-8 grid grid-cols-[max-content,max-content] gap-x-4 gap-y-8 items-center"
    >
      <template v-if="report.id != undefined">
        <label :for="`${prefix}-editor-url`">
          {{ $t('action.editor-url') }}
        </label>
        <b-textbox
          :id="`${prefix}-editor-url`"
          :model-value="editorUrl"
          readonly
          dark
        ></b-textbox>

        <label :for="`${prefix}-viewer-url`">
          {{ $t('action.viewer-url') }}
        </label>
        <b-textbox
          :id="`${prefix}-viewer-url`"
          :model-value="viewerUrl"
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
import { defineComponent, computed, onMounted, ref, useId } from "vue"
import { CCanvas, BTextbox, BDashboardCell } from '@schneefux/klicker/components'
import { Report, CubeQuery } from '@schneefux/klicker/types'
import { useStorage } from '@schneefux/klicker/composables'
import { formatClickhouseDate, getMonthSeasonEnd } from '~/lib/util'
import { useRoute } from "vue-router"
import { useSelfOrigin } from "~/composables/compat"

export default defineComponent({
  components: {
    BDashboardCell,
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
      if (route.query['id'] != undefined) {
        await update(parseInt(route.query['id'] as string))
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
      if (!import.meta.env.SSR && report.value.id != undefined) {
        return window.location.href.replace(location.search, '') + '?id=' + report.value.id
      } else {
        return ''
      }
    })
    const origin = useSelfOrigin()
    const viewerUrl = computed<string>(() => {
      if (embedUrl.value != undefined) {
        return origin + embedUrl.value
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

    const prefix = useId()

    return {
      report,
      canSave,
      embedUrl,
      editorUrl,
      viewerUrl,
      defaultQuery,
      prefix,
    }
  },
})
</script>
