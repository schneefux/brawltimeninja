<template functional>
  <router-link
    v-if="'player' in props.row.dimensions"
    :to="parent.localePath(`/player/${props.row.dimensionsRaw.player.player_tag}`)"
  >
    {{ props.row.dimensions.player }}
  </router-link>
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
