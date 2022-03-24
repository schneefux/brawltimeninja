<template>
  <media-img
    slot="preview"
    :path="id != 0 ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
    :alt="$te(`map.${id}`) ? $t(`map.${id}`): map"
    :clazz="clazz"
    size="512"
  ></media-img>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

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
})
</script>
