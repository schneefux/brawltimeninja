<template functional>
  <wrapped-component
    :wrap="props.link != undefined"
    class="contents"
  >
    <router-link
      slot="wrapper"
      :to="props.link || ''"
      class="contents"
    ></router-link>

    <component
      :is="props.tag"
      :class="[data.class, data.staticClass, 'flex flex-col rounded', {
        'h-full': props.fullHeight,
        'bg-dark-0': !props.light && !props.primary && props.elevation == 0,
        'bg-dark-1': !props.light && !props.primary && props.elevation == 1,
        'bg-dark-2': !props.light && !props.primary && props.elevation == 2,
        'bg-gray-200 text-gray-900': props.light,
        'bg-primary': props.primary,
        'elevation-0': props.elevation == 0,
        'elevation-1': props.elevation == 1,
        'elevation-2': props.elevation == 2,
        'loading': props.loading,
      }]"
      :style="data.staticStyle"
      v-bind="data.attrs"
    >
      <div
        v-if="'infobar' in $scopedSlots"
        class="rounded-t text-primary-lightest bg-gray-900 w-full px-2 py-1 text-lg font-semibold"
      >
        <slot name="infobar"></slot>
      </div>

      <header
        v-if="props.title != undefined || props.icon != undefined || 'preview' in $scopedSlots"
        :class="['w-full flex font-semibold items-center overflow-hidden', (props.color !== undefined ? `bg-${props.color}` : ''), {
          'px-3 py-2': !props.dense,
          'px-2 py-1': props.dense,
          'rounded-t': !('infobar' in $scopedSlots),
        }]"
      >
        <div
          v-if="props.icon != undefined"
          :class="['flex-shrink-0 flex justify-center items-center mr-3', {
            'w-10 h-10 my-1': !props.dense,
            'w-6 h-6 my-px': props.dense,
          }]"
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
            :class="{
              'text-xl': !props.dense,
              'text-lg': props.dense
            }"
          >
            <wrapped-component :wrap="props.titleLink != undefined">
              <router-link
                slot="wrapper"
                :to="props.titleLink || ''"
                class="contents"
              ></router-link>

              {{ props.title }}
            </wrapped-component>
          </h1>
          <h2
            v-if="props.subtitle != undefined"
            :class="['whitespace-nowrap', {
              'text-xl': props.subtitle.length < 20,
              'text-xs': props.subtitle.length >= 30,
            }]"
          >
            <wrapped-component :wrap="props.subtitleLink != undefined">
              <router-link
                slot="wrapper"
                :to="props.subtitleLink || ''"
                class="contents"
              ></router-link>

              {{ props.subtitle }}
            </wrapped-component>
          </h2>
        </div>

        <slot name="preview"></slot>
      </header>

      <div
        v-if="'content' in $scopedSlots"
        :class="[{
          'bg-cover bg-center bg-filter relative z-10': props.background != undefined,
          'px-3 py-2': !props.dense,
          'px-2 py-1': props.dense,
          'rounded-b bg-filter-rounded-b': !('actions' in $scopedSlots),
        }]"
        :style="{
          'background-image': props.background != undefined ? `url('${props.background}')` : undefined,
        }"
      >
        <slot name="content"></slot>
      </div>

      <footer
        v-if="'actions' in $scopedSlots"
        :class="['rounded-b text-primary-lightest w-full mt-auto font-semibold flex justify-end', {
          'px-3 py-2': !props.dense,
          'px-2 py-1': !props.dense,
        }]"
      >
        <slot name="actions"></slot>
      </footer>
    </component>
  </wrapped-component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    tag: {
      type: String,
      default: 'section'
    },
    link: {
      type: String,
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
    iconAlt: {
      type: String,
    },
    color: {
      type: String,
    },
    dense: {
      type: Boolean,
    },
    light: {
      type: Boolean
    },
    primary: {
      type: Boolean
    },
    elevation: {
      type: [Number, String],
      default: 1,
    },
    fullHeight: {
      type: Boolean
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

.bg-filter-rounded-b::after {
  @apply rounded-b;
}
</style>
