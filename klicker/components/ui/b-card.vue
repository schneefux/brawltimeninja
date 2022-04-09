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
    :aria-labelledby="renderTitle ? `${prefix}-title` : undefined"
  >
    <div
      :class="{
        'h-full': fullHeight,
        'bg-gray-100/75 dark:bg-gray-900/75': elevation == 0,
        'bg-black/[0.08] dark:bg-white/[.05]': elevation == 1,
        'bg-white/[.02]': elevation == 2,
        'bg-white/[.01]': elevation > 2,
        'border border-black/[.07]': elevation > 0,
        'shadow-sm': elevation == 0,
        'shadow': elevation == 1,
        'shadow-md': elevation == 2,
        'shadow-lg': elevation == 3,
        'shadow-xl': elevation == 4,
        'relative loading': loading,
        'cursor-pointer': link != undefined,
        'backdrop-blur': !noFilter,
      }"
      class="flex flex-col rounded-2xl"
      @click="onClick"
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
          'grid-cols-[auto,1fr,auto]': 'icon' in $scopedSlots || icon != undefined,
          'grid-cols-[1fr,auto]': !('icon' in $scopedSlots || icon != undefined),
        }]"
        class="shrink-0 grid items-center overflow-hidden text-gray-800 dark:text-gray-200"
        @click.stop="onClickHeader"
      >
        <slot
          name="icon"
          v-if="icon != undefined"
          :icon="icon"
          :icon-alt="iconAlt"
        >
          <img
            :src="icon"
            :alt="iconAlt"
            class="h-8"
          >
        </slot>

        <div v-if="title != undefined">
          <h1
            v-if="title != undefined"
            :id="`${prefix}-title`"
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
              <a
                :href="href"
                @click.stop="e => onClickLink() || navigate(e)"
              >{{ title }}</a>
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
              <a
                :href="href"
                @click.stop="e => onClickLink() || navigate(e)"
              >{{ subtitle }}</a>
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
        }]"
        :style="{
          'background-image': background != undefined ? `url('${background}')` : undefined,
        }"
        class="text-gray-800/75 dark:text-gray-200/75"
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
import { useRouter } from '@nuxtjs/composition-api'
import { defineComponent, computed } from 'vue-demi'
import { useUniqueId } from '../../composables/id'

export default defineComponent({
  props: {
    /** @deprecated */
    size: {
      type: String, // class
      default: ''
    },
    /** @deprecated */
    xxxs: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    xxs: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    xs: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    sm: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    md: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    lg: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    xl: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    xxl: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    xxxl: {
      type: Boolean,
      default: false
    },
    /** @deprecated */
    xxxxl: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      default: 'article'
    },
    link: {
      type: String,
    },
    title: {
      type: String,
    },
    titleLink: {
      type: [String, Function]
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
    noFilter: {
      // workaround for https://stackoverflow.com/a/52937920
      type: Boolean,
      default: false
    },
  },
  setup(props, { slots, listeners }) {
    const renderTitle = computed(() => props.title != undefined || props.icon != undefined || 'preview' in slots)
    const { id: prefix } = useUniqueId()

    const router = useRouter()

    /*
     * click event priority:
     *   1. @click header handler
     *   2. @click handler
     *   3. clicking on a link
     *   4. default card link
     */

    const onClick = () => {
      if (listeners.click != undefined) {
        listeners.click()
        return true
      }

      if (props.link != undefined) {
        router.push(props.link)
        return true
      }

      return false
    }

    const onClickLink = () => {
      if (listeners.click != undefined) {
        listeners.click()
        return true
      }

      return false
    }

    const onClickHeader = () => {
      if (listeners.clickHeader != undefined) {
        listeners.clickHeader()
        return true
      }

      return onClick()
    }

    return {
      onClick,
      onClickLink,
      onClickHeader,
      renderTitle,
      prefix,
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
