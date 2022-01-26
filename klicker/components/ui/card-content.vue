<template>
  <b-wrapped-component
    :wrap="$props.link != undefined"
    class="contents"
  >
    <router-link
      slot="wrapper"
      :to="$props.link || ''"
      class="contents"
    ></router-link>

    <component
      :is="$props.tag"
      :class="['flex flex-col rounded', {
        'h-full': $props.fullHeight,
        'bg-dark-0': !$props.light && $props.elevation == 0,
        'bg-dark-1': !$props.light && $props.elevation == 1,
        'bg-dark-2': !$props.light && $props.elevation == 2,
        'bg-dark-3': !$props.light && $props.elevation == 3,
        'bg-dark-4': !$props.light && $props.elevation == 4,
        'bg-gray-100 text-gray-800': $props.light,
        'shadow-sm': $props.elevation == 0,
        'shadow': $props.elevation == 1,
        'shadow-md': $props.elevation == 2,
        'shadow-lg': $props.elevation == 3,
        'shadow-xl': $props.elevation == 4,
        'relative loading': $props.loading,
      }]"
      v-bind="$attrs"
    >
      <div
        v-if="'infobar' in $scopedSlots"
        class="rounded-t w-full px-2 py-1"
      >
        <slot name="infobar"></slot>
      </div>

      <header
        v-if="$props.title != undefined || $props.icon != undefined || 'preview' in $scopedSlots"
        :class="['shrink-0 w-full flex font-semibold items-center overflow-hidden', ($props.color !== undefined ? `bg-${$props.color}` : ''), {
          'px-3 py-2': !$props.dense,
          'px-2 pt-1': $props.dense,
          'rounded-t': !('infobar' in $scopedSlots),
        }]"
      >
        <div
          v-if="$props.icon != undefined || 'icon' in $scopedSlots"
          :class="['shrink-0 flex justify-center items-center mr-3', {
            'w-10 h-10 my-2': !$props.dense,
            'w-6 h-6 my-1': $props.dense,
          }]"
        >
          <slot name="icon" v-bind="{ icon: $props.icon, alt: $props.iconAlt }">
            <img :src="$props.icon" :alt="$props.iconAlt">
          </slot>
        </div>

        <div
          v-if="$props.title != undefined"
          :class="['mr-auto', {
            'my-px': !$props.dense,
            'my-px': $props.dense,
          }]"
        >
          <h1
            v-if="$props.title != undefined"
            :class="{
              'text-lg leading-snug': !$props.dense,
              'leading-tight': $props.dense,
            }"
          >
            <b-wrapped-component :wrap="$props.titleLink != undefined">
              <router-link
                slot="wrapper"
                :to="$props.titleLink || ''"
                class="contents"
              ></router-link>

              {{ $props.title }}
            </b-wrapped-component>
          </h1>
          <h2
            v-if="$props.subtitle != undefined"
            :class="['whitespace-nowrap', {
              'text-lg': $props.subtitle.length < 20,
              'text-xs': $props.subtitle.length >= 30,
              'leading-snug': !$props.dense,
              'leading-tight': $props.dense,
            }]"
          >
            <b-wrapped-component :wrap="$props.subtitleLink != undefined">
              <router-link
                slot="wrapper"
                :to="$props.subtitleLink || ''"
                class="contents"
              ></router-link>

              {{ $props.subtitle }}
            </b-wrapped-component>
          </h2>
        </div>

        <slot name="preview"></slot>
      </header>

      <div
        v-if="'content' in $scopedSlots"
        :class="[{
          'bg-cover bg-center bg-filter relative z-10': $props.background != undefined,
          'px-3': !$props.dense,
          'pt-1': $props.title == undefined && !$props.dense,
          'pb-1': $props.background == undefined && !$props.dense,
          'py-2': $props.background != undefined && !$props.dense,
          'px-2': $props.dense,
          'pt-px': $props.title == undefined && $props.dense,
          'pb-px': $props.background == undefined && $props.dense,
          'py-px': $props.background != undefined && $props.dense,
          'rounded-b bg-filter-rounded-b': !('actions' in $scopedSlots),
          'h-full': $props.fullHeight,
        }]"
        :style="{
          'background-image': $props.background != undefined ? `url('${$props.background}')` : undefined,
        }"
      >
        <slot name="content"></slot>
      </div>

      <footer
        v-if="'actions' in $scopedSlots"
        :class="['rounded-b text-gray-800 w-full mt-auto flex justify-end', {
          'px-3 py-2': !$props.dense,
          'px-2 py-1': $props.dense,
        }]"
      >
        <slot name="actions"></slot>
      </footer>
    </component>
  </b-wrapped-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import BWrappedComponent from './b-wrapped-component'

export default defineComponent({
  components: {
    BWrappedComponent,
  },
  props: {
    tag: {
      type: String,
      default: 'section'
    },
    link: {
      type: String,
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
    elevation: {
      type: Number,
      default: 1,
    },
    fullHeight: {
      type: Boolean
    },
    loading: {
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

.loading:before {
  @apply absolute bottom-0 left-0 bg-red-600 h-1;

  content: '';
  animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes running-progress {
  0% {
    width: 0%;
    margin-left: 0px;
    margin-right: 100%;
  }
  50% {
    width: 75%;
    margin-left: 25%;
    margin-right: 0%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
    margin-right: 0;
  }
}
</style>

<style lang="postcss" scoped>
/* https://material.io/design/color/dark-theme.html#behavior */
/*
  theme('colors.gray.900') does not work,
  perhaps the colors plugin is executed before tailwind?
*/
.bg-dark-0 {
  background-color: color(#1a202c blend(white 0%));
}

.bg-dark-1 {
  background-color: color(#1a202c blend(white 5%));
}

.bg-dark-2 {
  background-color: color(#1a202c blend(white 7%));
}

.bg-dark-3 {
  background-color: color(#1a202c blend(white 8%));
}

.bg-dark-4 {
  background-color: color(#1a202c blend(white 9%));
}
</style>
