<script lang="ts">
import Vue from 'vue'
import { camelToKebab, slugify } from '~/lib/util'

export default Vue.extend({
  async validate({ params, error, redirect, $cube }) {
    const events = await $cube.query({
      cubeId: 'map',
      slices: {
        id: [params.event],
        season: [],
      },
      dimensionsIds: ['mode', 'map'],
      measurementsIds: [],
      sortId: 'timestamp',
    }, 1)
    if (events.data.length == 0) {
      error({ statusCode: 404, message: 'Event not found' })
      return true
    }
    const event = events.data[0]
    redirect(301, `/tier-list/mode/${camelToKebab(event.dimensionsRaw.mode.mode)}/map/${slugify(event.dimensionsRaw.map.map)}`)
    return true
  },
  middleware: ['cached'],
})
</script>
