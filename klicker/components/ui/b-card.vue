<template>
  <component
    :is="tag"
    :aria-labelledby="renderTitle ? `${prefix}-title` : undefined"
    class="h-full"
  >
    <div
      :class="{
        'bg-background/75': elevation == 0,
        'bg-contrast/[0.08]': elevation == 1,
        'bg-white/[.02]': elevation == 2,
        'bg-white/[.01]': elevation > 2,
        'shadow-sm': elevation == 0,
        'shadow': elevation == 1,
        'shadow-md': elevation == 2,
        'shadow-lg': elevation == 3,
        'shadow-xl': elevation == 4,
        'relative loading': loading,
        'cursor-pointer': link != undefined,
        'backdrop-blur': !noFilter,
      }"
      class="h-full flex flex-col rounded-2xl"
      @click="onClick"
    >
      <div
        v-if="'infobar' in $slots"
        class="rounded-t-2xl w-full py-1 text-sm px-6"
      >
        <slot name="infobar"></slot>
      </div>

      <header
        v-if="renderTitle"
        :class="[color, textColor, {
          'px-6 gap-x-3': !dense,
          'pb-4': !dense && ('content' in $slots) && !('infobar' in $slots),
          'pb-2': !dense && ('content' in $slots) && ('infobar' in $slots),
          'pb-6': !dense && !('content' in $slots),
          'pt-6': !dense && !('infobar' in $slots),
          'pt-2': !dense && 'infobar' in $slots,
          'px-3 gap-x-2 pt-2': dense,
          'rounded-t-2xl': !('infobar' in $slots),
          'grid-cols-[auto,1fr,auto]': 'icon' in $slots || icon != undefined,
          'grid-cols-[1fr,auto]': !('icon' in $slots || icon != undefined),
        }]"
        class="shrink-0 grid items-center overflow-hidden"
        @click.stop="onClickHeader"
      >
        <slot
          name="icon"
          v-if="icon != undefined || 'icon' in $slots"
          :icon="icon"
          :icon-alt="iconAlt"
        >
          <img
            :src="icon"
            :alt="iconAlt"
            class="h-8 w-8 object-contain"
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
            <template v-if="titleLink != undefined || link != undefined">
              <component
                v-if="linkComponent != undefined"
                :is="linkComponent"
                :to="titleLink || link"
              >
                {{ title }}
              </component>
              <a
                v-else
                :href="titleLink || link"
                class="contents"
                @click.stop="e => onClickLink() || navigate(e)"
              >{{ title }}</a>
            </template>
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
            <template v-if="subtitleLink != undefined">
              <component
                v-if="linkComponent != undefined"
                :is="linkComponent"
                :to="subtitleLink"
              >
                {{ title }}
              </component>
              <a
                v-else
                :href="subtitleLink"
                class="contents"
                @click.stop="e => onClickLink() || navigate(e)"
              >{{ subtitle }}</a>
            </template>
            <template v-else>
              {{ subtitle }}
            </template>
          </h2>
        </div>

        <slot name="preview"></slot>
      </header>

      <div
        v-if="'content' in $slots"
        :class="[{
          'bg-cover bg-center bg-filter relative z-10': background != undefined,
          'px-6': !dense,
          'pt-4': background == undefined && !dense && !renderTitle,
          'pb-4': background == undefined && !dense && !('actions' in $slots),
          'py-2': background != undefined && !dense,
          'px-3 py-1': dense,
          'rounded-t-2xl bg-filter-rounded-t-2xl': !renderTitle,
          'rounded-b-2xl bg-filter-rounded-b-2xl': !('actions' in $slots),
        }]"
        :style="{
          'background-image': background != undefined ? `url('${background}')` : undefined,
        }"
        class="h-full text-text/75"
      >
        <slot name="content"></slot>
      </div>

      <footer
        v-if="'actions' in $slots"
        :class="['rounded-b-2xl text-text flex justify-end mt-auto', {
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
import { defineComponent, computed } from 'vue'
import { useUniqueId } from '../../composables/id'
import { useKlicker } from '../../composables/klicker'

export default defineComponent({
  props: {
    tag: {
      type: String,
      default: 'article'
    },
    link: {
      type: String,
      required: false
    },
    title: {
      type: String,
      required: false
    },
    titleLink: {
      type: String,
      required: false
    },
    subtitle: {
      type: String,
      required: false
    },
    subtitleLink: {
      type: String,
      required: false
    },
    background: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: false
    },
    iconAlt: {
      type: String,
      required: false
    },
    color: {
      type: String,
      required: false
    },
    textColor: {
      type: String,
      default: 'text-text',
    },
    dense: {
      type: Boolean,
      required: false
    },
    elevation: {
      type: Number,
      default: 1,
    },
    loading: {
      type: Boolean,
      required: false
    },
    noFilter: {
      // workaround for https://stackoverflow.com/a/52937920
      type: Boolean,
      default: false
    },
    linkComponent: {
      type: undefined,
      required: false
    },
  },
  setup(props, { slots, attrs }) {
    const renderTitle = computed(() => props.title != undefined || props.icon != undefined || 'preview' in slots)
    const { id: prefix } = useUniqueId()

    const { navigate } = useKlicker()

    /*
     * click event priority:
     *   1. @click header handler
     *   2. @click handler
     *   3. clicking on a link
     *   4. default card link
     */

    const triggerClick = () => {
      if (Array.isArray(attrs.onClick)) {
        attrs.onClick.forEach((listener) => listener())
      } else {
        attrs.onClick()
      }
    }

    const onClick = () => {
      if (attrs.onClick != undefined) {
        triggerClick()
        return true
      }

      if (props.link != undefined) {
        if (!props.link.startsWith('http')) {
          navigate(props.link)
        } else {
          window.open(props.link, '_blank')
        }

        return true
      }

      return false
    }

    const onClickLink = () => {
      if (attrs.onClick != undefined) {
        triggerClick()
        return true
      }

      return false
    }

    const onClickHeader = () => {
      if (attrs.onClickHeader != undefined) {
        if (Array.isArray(attrs.onClickHeader)) {
          attrs.onClickHeader.forEach((listener) => listener())
        } else {
          attrs.onClickHeader()
        }
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
      navigate,
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
  @apply absolute bottom-0 left-0 bg-primary-500 h-1;

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
