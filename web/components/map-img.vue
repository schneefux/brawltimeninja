<template>
  <media-img
    slot="preview"
    :path="id != 0 ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
    :alt="mapName"
    :clazz="clazz"
    size="512"
    loading="lazy"
  ></media-img>
</template>

<script lang="ts">
import { defineComponent, toRefs } from '@nuxtjs/composition-api'
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
  },
  setup(props) {
    const { id, map } = toRefs(props)
    const mapName = useMapName(id, map)

    return {
      mapName,
    }
  }
})
</script>
