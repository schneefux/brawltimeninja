<template>
  <quiz-result-sharepic
    :result="testResult"
    class="sharepic"
  ></quiz-result-sharepic>
</template>

<script lang="ts">
import { useCacheHeaders, useCspHeaders } from '~/composables/compat'
import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import QuizResultSharepic from '~/components/quiz/quiz-result-sharepic.vue'
import { QuizResult } from '~/components/quiz/quiz-result-card.vue'

export default defineComponent({
  components: {
    QuizResultSharepic,
  },
  setup() {
    const route = useRoute()
    const testResult = computed<QuizResult>(() => {
      const query = route.query as Record<string, string>

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

    useCacheHeaders()
    useCspHeaders()

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

<route>
{
  meta: {
    layout: 'empty',
  },
}
</route>
