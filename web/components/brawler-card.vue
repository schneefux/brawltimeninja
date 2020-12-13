<template functional>
  <card
    :title="props.title"
    :title-link="`/tier-list/brawler/${props.brawlerId}`"
    sm
    v-bind="data.attrs"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass]"
  >
    <template v-slot:preview>
      <slot name="preview"></slot>
    </template>
    <template v-slot:content>
      <div class="relative">
        <media-img
          :path="'/brawlers/' + props.brawlerId + '/avatar'"
          :alt="props.brawler"
          size="160"
          clazz="z-0 absolute bottom-0 h-20"
        ></media-img>
        <media-img
          v-if="props.icon !== ''"
          :path="props.icon"
          :alt="props.title"
          size="80"
          clazz="absolute bottom-0 h-10 rounded-full p-1 ml-20 bg-gray-800 bg-opacity-50"
        ></media-img>
        <div class="flex flex-col justify-center items-end">
          <slot name="stats"></slot>
        </div>
      </div>
    </template>
    <template v-slot:actions>
      <slot name="actions"></slot>
    </template>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    title: {
      type: String,
      required: true,
    },
    brawler: {
      type: String,
      required: true,
    },
    brawlerId: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
  },
})
</script>
