<script lang="ts">
import { useCacheHeaders, useValidate } from '~/composables/compat'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    useCacheHeaders()
    useValidate(async ({ redirect }) => {
      redirect(301, '/tier-list/ranked')
      return true
    })
  },
})
</script>
