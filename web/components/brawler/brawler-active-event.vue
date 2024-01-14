<template>
  <event-card
    :mode="mode"
    :map="map"
    :event-id="eventId"
  >
    <template
      v-if="end != undefined"
      v-slot:infobar
    >
      <i18n-t
        keypath="time.ends-in"
        tag="p"
        class="text-right"
        scope="global"
      >
        <template v-slot:time>
          <relative-time :timestamp="endTimestamp" add-suffix></relative-time>
        </template>
      </i18n-t>
    </template>

    <template v-slot:content>
      <div class="h-full flex flex-col justify-center">
        <brawler-kv-card
          :brawler-name="brawlerName"
          :slices="slices"
        ></brawler-kv-card>
      </div>
    </template>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { parseISO } from 'date-fns'

export default defineComponent({
  props: {
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
    eventId: {
      type: [String, Number],
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    end: {
      type: String,
    },
  },
  setup(props) {
    const endTimestamp = computed(() => props.end != undefined ? parseISO(props.end) : undefined)

    const slices = computed(() => ({
      map: [props.map],
      mode: [props.mode],
    }))

    return {
      endTimestamp,
      slices,
    }
  },
})
</script>
