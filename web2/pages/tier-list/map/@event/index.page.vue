<script lang="ts">
import { useCacheHeaders, useValidate } from '@/composables/compat'
import { useKlicker } from '@schneefux/klicker/composables'
import { defineComponent } from 'vue'
import { camelToKebab, slugify } from '~/lib/util'

export default defineComponent({
  setup() {
    const $klicker = useKlicker()

    useCacheHeaders()
    useValidate(async ({ params, error, redirect }) => {
      const events = await $klicker.query({
        cubeId: 'map',
        slices: {
          id: [params.event],
          season: [],
        },
        dimensionsIds: ['mode', 'map'],
        metricsIds: [],
        sortId: 'timestamp',
        limit: 1,
      })
      if (events.data.length == 0) {
        error({ statusCode: 404, message: 'Event not found' })
        return true
      }
      const event = events.data[0]
      redirect(301, `/tier-list/mode/${camelToKebab(event.dimensionsRaw.mode.mode)}/map/${slugify(event.dimensionsRaw.map.map)}`)
      return true
    })
  },
})
</script>
