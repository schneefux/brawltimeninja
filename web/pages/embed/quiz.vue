<template>
  <quiz-result-sharepic
    :result="testResult"
    class="sharepic"
    full-height
  ></quiz-result-sharepic>
</template>

<script lang="ts">
import { computed, defineComponent, useRoute } from '@nuxtjs/composition-api'
import { MetaInfo } from 'vue-meta'
import { QuizResult } from '~/components/quiz/quiz-result-card.vue'

export default defineComponent({
  head(): MetaInfo {
    // block all requests except to subdomains (including ads/analytics)
    const allowedOrigins = [this.$config.mediaUrl, this.$config.cubeUrl, this.$config.apiUrl]
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
    const testResult = computed<QuizResult>(() => {
      const query = route.value.query as Record<string, string>

      return {
        id: query.id,
        name: query.name,
        similarity: parseFloat(query.similarity),
        score: {
          ie: parseFloat(query.ie),
          sn: parseFloat(query.sn),
          ft: parseFloat(query.ft),
          jp: parseFloat(query.jp),
        },
      }
    })

    return {
      testResult,
    }
  },
})
</script>

<style lang="postcss" scoped>
.sharepic {
  width: 600px;
  height: 315px;
}
</style>
