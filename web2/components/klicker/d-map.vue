<template functional>
  <router-link
    :to="parent.localePath(`/tier-list/mode/${props.camelToKebab(props.row.dimensionsRaw.map.mode || '')}/map/${props.row.dimensionsRaw.map.map}`)"
    :class="['flex items-center', data.class, data.staticClass]"
    :style="data.staticStyle"
    @click.native.stop
  >
    <div class="mr-2 w-10 sm:w-12 md:w-14">
      <map-img
        :id="props.row.dimensionsRaw.map.eventId"
        :map="props.row.dimensionsRaw.map.map"
        clazz="h-6 sm:h-8 md:h-10"
      ></map-img>
    </div>
    <span
      v-if="props.captioned"
      class="w-16 md:w-24"
    >{{ props.row.dimensions.map }}</span>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue'
import { camelToKebab } from '~/lib/util'

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
    camelToKebab: {
      type: Function,
      default: camelToKebab
    },
  },
})
</script>
