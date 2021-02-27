<template functional>
  <wrapped-component
    v-if="'player' in props.row.dimensions"
    :wrap="'player_tag' in props.row.dimensionsRaw.player"
    class="flex items-center"
  >
    <template v-slot:wrapper>
      <router-link
        :to="parent.localePath(`/player/${props.row.dimensionsRaw.player.player_tag}`)"
        class="flex items-center"
      ></router-link>
    </template>

    <media-img
      v-if="'player_icon_id' in props.row.dimensionsRaw.player"
      :path="`/avatars/${props.row.dimensionsRaw.player.player_icon_id}`"
      clazz="h-8"
      wrapper-class="flex-shrink-0"
    ></media-img>
    <span class="ml-2">
      {{ props.row.dimensions.player }}
    </span>
  </wrapped-component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    row: {
      type: Object,
      required: true
    },
    captioned: {
      type: Boolean
    },
  },
})
</script>
