<template>
  <component
    :is="tag"
    :class="['p-1', size, {
      'w-48': xxxs,
      'w-64': xxs,
      'w-full max-w-xs': xs,
      'w-full max-w-sm': sm,
      'w-full max-w-md': md,
      'w-full max-w-lg': lg,
      'w-full max-w-xl': xl,
      'w-full max-w-2xl': xxl,
      'w-full max-w-3xl': xxxl,
      'w-full max-w-4xl': xxxxl,
    }]"
  >
    <div
      :class="['flex flex-col rounded', {
        'h-full': fullHeight,
        'bg-dark-0': !light && elevation == 0,
        'bg-dark-1': !light && elevation == 1,
        'bg-dark-2': !light && elevation == 2,
        'bg-dark-3': !light && elevation == 3,
        'bg-dark-4': !light && elevation == 4,
        'bg-gray-100 text-gray-800': light,
        'shadow-sm': elevation == 0,
        'shadow': elevation == 1,
        'shadow-md': elevation == 2,
        'shadow-lg': elevation == 3,
        'shadow-xl': elevation == 4,
        'relative loading': loading,
        'cursor-pointer': link != undefined,
      }]"
      @click="link != undefined ? $router.push(link) : undefined"
    >
      <div
        v-if="'infobar' in $scopedSlots"
        class="rounded-t w-full px-2 py-1 text-sm"
      >
        <slot name="infobar"></slot>
      </div>

      <header
        v-if="title != undefined || icon != undefined || 'preview' in $scopedSlots"
        :class="['shrink-0 grid items-center overflow-hidden', (color !== undefined ? color : ''), {
          'px-6 gap-x-3 pt-4 pb-2': !dense,
          'px-2 gap-x-2 pt-1': dense,
          'rounded-t': !('infobar' in $scopedSlots),
          'grid-cols-[auto,1fr,auto]': 'icon' in $scopedSlots,
          'grid-cols-[1fr,auto]': !('icon' in $scopedSlots),
        }]"
      >
        <slot
          name="icon"
          v-if="icon != undefined || 'icon' in $scopedSlots"
          v-bind="{ icon: icon, alt: iconAlt }"
        >
          <img :src="icon" :alt="iconAlt">
        </slot>

        <div v-if="title != undefined">
          <h1
            v-if="title != undefined"
            :class="{
              'text-lg leading-snug': !dense,
              'text-sm leading-tight': dense,
            }"
          >
            <router-link
              v-if="titleLink != undefined"
              v-slot="{ href, navigate }"
              :to="titleLink"
              class="contents"
              custom
            >
              <a :href="href" @click.stop="navigate">{{ title }}</a>
            </router-link>
            <template v-else>
              {{ title }}
            </template>
          </h1>
          <h2
            v-if="subtitle != undefined"
            :class="['whitespace-nowrap', {
              'text-xs': subtitle.length >= 30,
              'leading-snug': !dense,
              'leading-tight': dense,
            }]"
          >
            <router-link
              v-if="subtitleLink != undefined"
              v-slot="{ href, navigate }"
              :to="subtitleLink"
              class="contents"
              custom
            >
              <a :href="href" @click.stop="navigate">{{ subtitle }}</a>
            </router-link>
            <template v-else>
              {{ subtitle }}
            </template>
          </h2>
        </div>

        <slot name="preview"></slot>
      </header>

      <div
        v-if="'content' in $scopedSlots"
        :class="[{
          'bg-cover bg-center bg-filter relative z-10': background != undefined,
          'px-6': !dense,
          'pt-4': title == undefined && !dense,
          'pb-4': background == undefined && !dense,
          'py-2': background != undefined && !dense,
          'px-2': dense,
          'pt-px': title == undefined && dense,
          'pb-px': background == undefined && dense,
          'py-px': background != undefined && dense,
          'rounded-b bg-filter-rounded-b': !('actions' in $scopedSlots),
          'h-full': fullHeight,
        }]"
        :style="{
          'background-image': background != undefined ? `url('${background}')` : undefined,
        }"
      >
        <slot name="content"></slot>
      </div>

      <footer
        v-if="'actions' in $scopedSlots"
        :class="['rounded-b text-gray-800 flex justify-end', {
          'px-6 gap-x-3 pt-2 pb-4': !dense,
          'px-2 gap-x-2 py-1': dense,
        }]"
      >
        <slot name="actions"></slot>
      </footer>
    </div>
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  props: {
    size: {
      type: String, // class
      default: ''
    },
    xxxs: {
      type: Boolean,
      default: false
    },
    xxs: {
      type: Boolean,
      default: false
    },
    xs: {
      type: Boolean,
      default: false
    },
    sm: {
      type: Boolean,
      default: false
    },
    md: {
      type: Boolean,
      default: false
    },
    lg: {
      type: Boolean,
      default: false
    },
    xl: {
      type: Boolean,
      default: false
    },
    xxl: {
      type: Boolean,
      default: false
    },
    xxxl: {
      type: Boolean,
      default: false
    },
    xxxxl: {
      type: Boolean,
      default: false
    },
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
