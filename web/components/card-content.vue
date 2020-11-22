<template functional>
  <div>
    <div
      v-if="'infobar' in $scopedSlots"
      class="text-primary-lightest bg-gray-900 w-full px-2 py-1 text-lg font-semibold">
      <slot name="infobar"></slot>
    </div>

    <div
      v-if="props.title != undefined || props.icon != undefined || 'preview' in $scopedSlots"
      :class="'w-full px-3 py-2 flex font-semibold justify-between items-center ' + (props.color !== undefined ? `bg-${props.color}` : '')"
    >
      <div class="flex items-center">
        <div
          v-if="props.icon != undefined"
          class="w-10 h-10 my-1 flex justify-center items-center"
        >
          <media-img
            :path="props.icon"
            size="120"
          ></media-img>
        </div>
        <div
          v-if="props.title != undefined"
          :class="{
            'ml-3': props.icon != undefined,
            'text-white': true,
          }"
        >
          <router-link
            v-if="props.titleLink != undefined"
            :to="props.titleLink"
            class="block text-xl"
          >
            {{ props.title }}
          </router-link>
          <p
            v-else
            class="text-xl"
          >
            {{ props.title }}
          </p>
          <p
            v-if="props.subtitle != undefined && props.subtitleLink == undefined"
            :class="{
              'text-xl': props.subtitle.length < 20,
              'text-xs': props.subtitle.length > 40,
            }">
            {{ props.subtitle }}
          </p>
          <router-link
            v-if="props.subtitle != undefined && props.subtitleLink != undefined"
            :to="props.subtitleLink"
            :class="{
              'block': true,
              'text-xl': props.subtitle.length < 20,
            }">
            {{ props.subtitle }}
          </router-link>
        </div>
      </div>
      <slot name="preview"></slot>
    </div>
    <div
      v-if="'content' in $scopedSlots"
      :class="{
        'px-3 py-2 mx-auto': true,
        [props.size]: true,
        'bg-cover bg-center bg-filter relative z-10': props.background != undefined,
      }"
      :style="props.background != undefined ? {
        'background-image': `url('${props.background}')`,
      } : {}"
    >
      <div class="relative z-20">
        <slot name="content"></slot>
      </div>
    </div>
    <div
      v-if="'actions' in $scopedSlots"
      class="px-3 py-2 bg-gray-800 text-primary-lightest w-full font-semibold"
    >
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    size: {
      type: String, // class
      default: ''
    },
    title: {
      type: String,
    },
    titleLink: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    subtitleLink: {
      type: String,
    },
    background: {
      type: String,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
    },
  },
})
</script>

<style lang="postcss" scoped>
.bg-filter::after {
  content: '';
  @apply block absolute top-0 left-0 w-full h-full;
  backdrop-filter: brightness(50%) grayscale(25%);
}
</style>
