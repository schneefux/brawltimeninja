<template>
  <b-page :title="$t('dashboard-designer.title')" no-container>
    <c-grid
      v-model="grid"
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
  </b-page>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, useRoute } from "@nuxtjs/composition-api"
import { CGrid, BTextbox, CDashboardCell } from '@schneefux/klicker/components'
import { Grid, CubeQuery } from '@schneefux/klicker/types'
import { useStorage } from '@schneefux/klicker/composables'
import { formatClickhouseDate, getMonthSeasonEnd } from '~/lib/util'
import { useUniqueId } from '@schneefux/klicker/composables'

export default defineComponent({
  components: {
    CDashboardCell,
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
      grid,
      canSave,
      editorUrl,
      viewerUrl,
      defaultQuery,
    }
  }
})
</script>
