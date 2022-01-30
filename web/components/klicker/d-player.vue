<template>
  <component
    :is="link != undefined ? 'router-link' : 'div'"
    :to="link"
    class="flex items-center"
  >
    <media-img
      v-if="icon != undefined"
      :path="icon"
      clazz="h-8"
      wrapper-class="shrink-0"
    ></media-img>
    <span class="ml-2">
      {{ row.dimensions.player }}
    </span>
  </component>
</template>

<script lang="ts">
import { defineComponent, computed, useContext } from '@nuxtjs/composition-api'
import { idToTag } from '~/lib/util'

export default defineComponent({
  props: {
    row: {
      type: Object,
      required: true
    },
    captioned: {
      type: Boolean
    },
  },
  setup(props) {
    const { localePath } = useContext()
    const icon = computed(() => props.row.dimensionsRaw.player?.playerIcon != undefined ? `/avatars/${props.row.dimensionsRaw.player.playerIcon}` : undefined)
    const link = computed(() => props.row.dimensionsRaw.player?.player != undefined ? localePath(`/profile/${idToTag(props.row.dimensionsRaw.player.player).substring(1)}`) : undefined)

    return {
      link,
      icon,
      idToTag,
    }
  },
})
</script>
