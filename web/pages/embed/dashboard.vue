<template>
  <c-grid-renderer
    :grid="grid"
    class="sharepic"
  ></c-grid-renderer>
</template>

<script lang='ts'>
import { defineComponent, useRoute, useAsync } from "@nuxtjs/composition-api"
import { CGridRenderer } from '@schneefux/klicker/components'
import { MetaInfo } from 'vue-meta'
import { Grid } from "@schneefux/klicker/types"
import useFeathers from "@schneefux/klicker/composables/feathers"

export default defineComponent({
  components: {
    CGridRenderer,
  },
  head(): MetaInfo {
    // block all requests except to subdomains (including ads/analytics)
    const allowedOrigins = [this.$config.mediaUrl, this.$config.cubeUrl]
    return {
      meta: [ <any>{
        // FIXME remove any after https://github.com/nuxt/vue-meta/issues/575
        'http-equiv': 'Content-Security-Policy',
        content: `default-src 'self' 'unsafe-inline' 'unsafe-eval' ${allowedOrigins.join(' ')}`,
      } ]
    }
  },
  layout: 'empty',
  middleware: ['cached'],
  setup() {
    const route = useRoute()

    const { client } = useFeathers()
    const grid = useAsync<Grid>(() => client.service('grids').get(parseInt(route.value.query['id'] as string)))

    return {
      grid,
    }
  }
})
</script>
