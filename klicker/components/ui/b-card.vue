<template>
  <component
    :is="tag"
    :class="[size, {
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
      'h-full': fullHeight,
    }]"
  >
    <div
      :class="{
        'h-full': fullHeight,
        'bg-gray-900/75 hover:bg-gray-900/60': !light && elevation == 0,
        'bg-white/[.03] hover:bg-white/[.04]': !light && elevation == 1,
        'bg-white/[.05] hover:bg-white/[.06]': !light && elevation == 2,
        'bg-white/[.07] hover:bg-white/[0.08]': !light && elevation == 3,
        'bg-white/[.1] hover:bg-white/[0.11]': !light && elevation == 4,
        'bg-gray-100': light,
        'shadow-sm': elevation == 0,
        'shadow': elevation == 1,
        'shadow-md': elevation == 2,
        'shadow-lg': elevation == 3,
        'shadow-xl': elevation == 4,
        'relative loading': loading,
        'cursor-pointer': link != undefined,
      }"
      class="flex flex-col rounded-2xl"
      @click="link != undefined ? $router.push(link) : undefined"
    >
      <div
        v-if="'infobar' in $scopedSlots"
        class="rounded-t-2xl w-full py-1 text-sm px-6"
      >
        <slot name="infobar"></slot>
      </div>

      <header
        v-if="renderTitle"
        :class="[(color !== undefined ? color : ''), {
          'px-6 gap-x-3': !dense,
          'pb-4': !dense && ('content' in $scopedSlots) && !('infobar' in $scopedSlots),
          'pb-2': !dense && ('content' in $scopedSlots) && ('infobar' in $scopedSlots),
          'pb-6': !dense && !('content' in $scopedSlots),
          'pt-6': !dense && !('infobar' in $scopedSlots),
          'pt-2': !dense && 'infobar' in $scopedSlots,
          'px-3 gap-x-2 pt-2': dense,
          'rounded-t-2xl': !('infobar' in $scopedSlots),
          'grid-cols-[auto,1fr,auto]': 'icon' in $scopedSlots,
          'grid-cols-[1fr,auto]': !('icon' in $scopedSlots),
          'text-gray-800': light,
        }]"
        class="shrink-0 grid items-center overflow-hidden"
      >
        <slot
          name="icon"
          v-if="icon != undefined"
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
              v-if="titleLink != undefined || link != undefined"
              v-slot="{ href, navigate }"
              :to="titleLink || link"
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
          'pt-4': background == undefined && !dense && !renderTitle,
          'pb-4': background == undefined && !dense && !('actions' in $scopedSlots),
          'py-2': background != undefined && !dense,
          'px-3 py-1': dense,
          'rounded-t-2xl bg-filter-rounded-t-2xl': !renderTitle,
          'rounded-b-2xl bg-filter-rounded-b-2xl': !('actions' in $scopedSlots),
          'h-full': fullHeight,
          'text-gray-200/75': !light,
          'text-gray-800': light,
        }]"
        :style="{
          'background-image': background != undefined ? `url('${background}')` : undefined,
        }"
      >
        <slot name="content"></slot>
      </div>

      <footer
        v-if="'actions' in $scopedSlots"
        :class="['rounded-b-2xl text-gray-800 flex justify-end mt-auto', {
          'px-6 gap-x-3 pt-4 pb-6': !dense,
          'px-3 gap-x-2 py-1': dense,
        }]"
      >
        <slot name="actions"></slot>
      </footer>
    </div>
  </component>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue-demi'

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
  setup(props, { slots }) {
    const renderTitle = computed(() => props.title != undefined || props.icon != undefined || 'preview' in slots)

    return {
      renderTitle,
    }
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

.bg-filter-rounded-b-2xl::after {
  @apply rounded-b-2xl;
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
