<script lang="ts">
import Vue from 'vue'
import { camelToKebab, slugify } from '~/lib/util'

export default Vue.extend({
  async validate({ params, error, redirect, $clicker }) {
    const events = await $clicker.query('all.events', 'map',
      ['battle_event_id', 'battle_event_mode', 'battle_event_map'],
      ['battle_event_id'],
      {
        battle_event_id: [params.event],
      },
      { cache: 60*60*24 })
    if (events.data.length == 0) {
      error({ statusCode: 404, message: 'Event not found' })
      return true
    }
    const event = events.data[0]
    redirect(301, `/tier-list/mode/${camelToKebab(event.battle_event_mode)}/map/${slugify(event.battle_event_map)}`)
    return true
  },
})
</script>
