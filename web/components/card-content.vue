<template functional>
  <section
    :class="[data.class, data.staticClass]"
    :style="data.staticStyle"
  >
    <div
      v-if="'infobar' in $scopedSlots"
      class="text-primary-lightest bg-gray-900 w-full px-2 py-1 text-lg font-semibold"
    >
      <slot name="infobar"></slot>
    </div>

    <header
      v-if="props.title != undefined || props.icon != undefined || 'preview' in $scopedSlots"
      :class="['w-full px-3 py-2 flex font-semibold items-center', (props.color !== undefined ? `bg-${props.color}` : '')]"
    >
      <div
        v-if="props.icon != undefined"
        class="w-10 h-10 my-1 flex justify-center items-center mr-3"
      >
        <media-img
          :path="props.icon"
          :alt="props.iconAlt"
          size="120"
        ></media-img>
      </div>

      <div
        v-if="props.title != undefined"
        class="mr-auto"
      >
        <h1
          v-if="props.title != undefined"
          class="text-xl"
        >
          <router-link
            v-if="props.titleLink != undefined"
            :to="props.titleLink"
            class="block"
          >
            {{ props.title }}
          </router-link>
          <template v-else>
            {{ props.title }}
          </template>
        </h1>
        <h2
          v-if="props.subtitle != undefined"
          :class="{
            'text-xl': props.subtitle.length < 20,
            'text-xs': props.subtitle.length > 40,
          }">
          <router-link
            v-if="props.subtitleLink != undefined"
            :to="props.subtitleLink"
            class="block"
          >
            {{ props.subtitle }}
          </router-link>
          <template v-else>
            {{ props.subtitle }}
          </template>
        </h2>
      </div>

      <slot name="preview"></slot>
    </header>

    <div
      v-if="'content' in $scopedSlots"
      :class="['px-3 py-2', {
        'bg-cover bg-center bg-filter relative z-10': props.background != undefined,
      }]"
      :style="{
        'background-image': props.background != undefined ? `url('${props.background}')` : undefined,
      }"
    >
      <slot name="content"></slot>
    </div>

    <footer
      v-if="'actions' in $scopedSlots"
      class="px-3 py-2 bg-gray-800 text-primary-lightest w-full font-semibold flex justify-end"
    >
      <slot name="actions"></slot>
    </footer>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
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
    iconAlt: {
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
  z-index: -1;
}
</style>
