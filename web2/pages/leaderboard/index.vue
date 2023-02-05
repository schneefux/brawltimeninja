<script lang="ts">
import { useCacheHeaders, useValidate } from '@/composables/compat'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    useCacheHeaders()
    useValidate(async ({ redirect }) => {
      redirect(301, '/leaderboard/hours')
      return true
    })
  },
})
</script>
