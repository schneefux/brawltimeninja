<template functional>
  <b-wrapped-component
    v-if="'player' in props.row.dimensions"
    :wrap="'player' in props.row.dimensionsRaw.player"
    :class="['flex items-center', data.class, data.staticClass]"
    :style="data.staticStyle"
  >
    <template v-slot:wrapper>
      <router-link
        :to="parent.localePath(`/profile/${props.idToTag(props.row.dimensionsRaw.player.player).substring(1)}`)"
        :class="['flex items-center', data.class, data.staticClass]"
        :style="data.staticStyle"
      ></router-link>
    </template>

    <media-img
      v-if="'playerIcon' in props.row.dimensionsRaw.player"
      :path="`/avatars/${props.row.dimensionsRaw.player.playerIcon}`"
      clazz="h-8"
      wrapper-class="flex-shrink-0"
    ></media-img>
    <span class="ml-2">
      {{ props.row.dimensions.player }}
    </span>
  </b-wrapped-component>
</template>

<script lang="ts">
import Vue from 'vue'
import { idToTag } from '~/lib/util'

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
    idToTag: {
      default: () => idToTag,
    },
  },
})
</script>
