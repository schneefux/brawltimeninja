<template>
  <c-canvas-renderer
    v-if="report != undefined"
    :report="report"
    class="sharepic"
  ></c-canvas-renderer>
</template>

<script lang='ts'>
import { defineComponent, computed } from "vue"
import { CCanvasRenderer } from '@schneefux/klicker/components'
import { Report } from "@schneefux/klicker/types"
import useFeathers from "@schneefux/klicker/composables/feathers"
import { useRoute } from "vue-router"
import { useAsync, useCacheHeaders, useCspHeaders } from "~/composables/compat"

export default defineComponent({
  components: {
    CCanvasRenderer,
  },
  setup() {
    const route = useRoute()

    const { client } = useFeathers()
    const report = useAsync<Report>(() => client.service('reports').get(parseInt(route.query['id'] as string)),
      computed(() => 'report-' + route.query['id']))

    useCacheHeaders()
    useCspHeaders()

    return {
      report,
    }
  }
})
</script>

<route>
{
  meta: {
    layout: 'empty',
  },
}
</route>
