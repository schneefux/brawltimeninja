<template>
  <c-grid-renderer
    v-if="grid != undefined"
    :grid="grid"
    class="sharepic"
  ></c-grid-renderer>
</template>

<script lang='ts'>
import { defineComponent, computed } from "vue"
import { CGridRenderer } from '@schneefux/klicker/components'
import { Grid } from "@schneefux/klicker/types"
import useFeathers from "@schneefux/klicker/composables/feathers"
import { useRoute } from "vue-router"
import { useAsync, useCacheHeaders, useCspHeaders } from "@/composables/compat"

export default defineComponent({
  components: {
    CGridRenderer,
  },
  setup() {
    const route = useRoute()

    const { client } = useFeathers()
    const grid = useAsync<Grid>(() => client.service('grids').get(parseInt(route.query['id'] as string)),
      computed(() => 'grid-' + route.query['id']))

    useCacheHeaders()
    useCspHeaders()

    return {
      grid,
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
