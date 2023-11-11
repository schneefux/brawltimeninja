<template>
  <media-img
    :path="path"
    :alt="mapName"
    :clazz="clazz"
    :size="size"
    loading="lazy"
  ></media-img>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue'
import { useMapName } from '~/composables/map'

export default defineComponent({
  props: {
    eventId: {
      type: [Number, String],
      required: true
    },
    map: {
      type: String,
      required: true
    },
    clazz: {
      type: String,
      required: false
    },
    size: {
      type: String,
      required: false,
      default: '512'
    },
  },
  setup(props) {
    const { eventId, map } = toRefs(props)
    const mapName = useMapName(eventId, map)
    const path = computed(() => props.eventId != 0 ? `/maps/${props.eventId}` : `/maps/competition-winners/${props.map.replace('Competition Winner ', '')}`)

    return {
      mapName,
      path,
    }
  }
})
</script>
