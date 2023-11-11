<template>
  <event-card
    :mode="mode"
    :map="map"
    :link="mapPath"
    :event-id="eventId"
    nobackground
  >
    <template v-slot:preview></template>
    <template v-slot:content>
      <div class="pt-4 h-full flex flex-col justify-center">
        <map-img
          :event-id="eventId"
          :map="map"
          clazz="w-full h-48 object-contain"
        ></map-img>
        <slot></slot>
      </div>
    </template>
  </event-card>
</template>

<script lang="ts">
import { useLocalePath } from '@/composables/compat'
import { computed, defineComponent } from 'vue'
import { camelToKebab, slugify } from '~/lib/util'

export default defineComponent({
  props: {
    mode: {
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
  },
  setup(props) {
    const localePath = useLocalePath()
    const mapPath = computed(() => localePath(`/tier-list/mode/${camelToKebab(props.mode)}/map/${slugify(props.map)}`))

    return {
      mapPath,
    }
  },
})
</script>
