<template>
  <c-canvas-renderer
    :report="report"
    class="sharepic"
  ></c-canvas-renderer>
</template>

<script lang='ts'>
import { defineComponent, useRoute, useAsync } from "@nuxtjs/composition-api"
import { CCanvasRenderer } from '@schneefux/klicker/components'
import { MetaInfo } from 'vue-meta'
import { Report } from "@schneefux/klicker/types"
import useFeathers from "@schneefux/klicker/composables/feathers"

export default defineComponent({
  components: {
    CCanvasRenderer,
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
    const report = useAsync<Report>(() => client.service('reports').get(parseInt(route.value.query['id'] as string)))

    return {
      report,
    }
  }
})
</script>
