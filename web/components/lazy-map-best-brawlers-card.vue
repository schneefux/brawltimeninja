<template>
  <lazy
    distance="320px"
    :render="eager"
    translucent
  >
    <div style="height: 320px; width: 320px" slot="placeholder"></div>
    <map-best-brawlers-card v-bind="$attrs"></map-best-brawlers-card>
  </lazy>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    eager: {
      type: Boolean,
      default: false
    },
  },
})
</script>
