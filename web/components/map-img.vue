<template>
  <media-img
    slot="preview"
    :path="path"
    :alt="mapName"
    :clazz="clazz"
    :size="size"
    loading="lazy"
  ></media-img>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from '@nuxtjs/composition-api'
import { useMapName } from '~/composables/map'

export default defineComponent({
  props: {
    id: {
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
    const { id, map } = toRefs(props)
    const mapName = useMapName(id, map)
    const path = computed(() => props.id != 0 ? `/maps/${props.id}` : `/maps/competition-winners/${props.map.replace('Competition Winner ', '')}`)

    return {
      mapName,
      path,
    }
  }
})
</script>
