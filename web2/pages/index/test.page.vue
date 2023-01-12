<template>
  <div>
    <h1>Welcome</h1>
    <!--
    <events-roll
      :events="events"
      with-data
    ></events-roll>
    -->

    <h1>Test</h1>
    <client-only>
    <map-best-brawlers :limit="3" :card="{}"></map-best-brawlers>
    </client-only>
  </div>
</template>

<script lang="ts">
import { useActiveEvents } from '@/composables/dimension-values';
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const events = useActiveEvents([], {
      powerplay: ['0'],
    })

    return {
      events,
    }
  }
})
</script>
