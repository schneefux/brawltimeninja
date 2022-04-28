<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  async validate({ redirect }) {
    redirect(301, '/leaderboard/hours')
    return true
  },
  middleware: ['cached'],
})
</script>
