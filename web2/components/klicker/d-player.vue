<template>
  <component
    :is="link != undefined ? 'router-link' : 'div'"
    :to="link"
    class="flex items-center"
    @click.native.stop
  >
    <media-img
      v-if="icon != undefined"
      :path="icon"
      :alt="row.dimensions.player"
      size="200"
      clazz="h-8 w-8 object-contain"
    ></media-img>
    <span class="ml-2">
      {{ row.dimensions.player }}
    </span>
  </component>
</template>

<script lang="ts">
import { useLocalePath } from '@/composables/compat'
import { defineComponent, computed } from 'vue'
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
    const localePath = useLocalePath()
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
