<template>
  <full-page :title="$t('dashboard-designer.title')">
    <c-grid
      v-model="grid"
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
    </c-grid>

    <div
      v-if="canSave"
      class="mt-8 grid grid-cols-[max-content_max-content] gap-x-8 gap-y-4 items-center"
    >
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
        ref="viewerRef"
        readonly
        dark
      ></b-textbox>
    </div>
    <div v-else class="mt-8 flex flex-col gap-y-4">
      <p>Log in to share this report.</p>
      <login-button></login-button>
    </div>
  </full-page>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, useId } from "vue"
import { CGrid, BTextbox, BDashboardCell } from '@schneefux/klicker/components'
import { Grid, CubeQuery } from '@schneefux/klicker/types'
import { useStorage } from '@schneefux/klicker/composables'
import { formatClickhouseDate, getMonthSeasonEnd } from '~/lib/util'
import { useRoute } from "vue-router"
import { useSelfOrigin } from "~/composables/compat"

export default defineComponent({
  components: {
    BDashboardCell,
    BTextbox,
    CGrid,
  },
  setup() {
    const { storage: grid, update, canSave } = useStorage<Grid>('grids', {
      id: undefined,
      title: 'New Dashboard',
      widgets: [],
      columns: undefined,
    })

    const route = useRoute()
    onMounted(async () => {
      if (route.query['id'] != undefined) {
        await update(parseInt(route.query['id'] as string))
      }
    })

    const editorUrl = computed<string>(() => {
      if (!import.meta.env.SSR) {
        return window.location.href + '?id=' + grid.value.id
      } else {
        return ''
      }
    })
    const origin = useSelfOrigin()
    const viewerUrl = computed<string>(() => origin + '/embed/dashboard?id=' + grid.value.id)

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
      grid,
      canSave,
      editorUrl,
      viewerUrl,
      defaultQuery,
      prefix,
    }
  }
})
</script>
