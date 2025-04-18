<template>
  <component
    :is="tag"
    :aria-labelledby="title != undefined ? id : undefined"
    class="h-full"
  >
    <div
      :class="{
        'bg-background': elevation == -1,
        'bg-background/75': elevation == 0,
        'bg-contrast/[0.08]': elevation == 1,
        'bg-white/[.02]': elevation == 2,
        'bg-white/[.01]': elevation > 2,
        'shadow-xs': elevation == 0,
        'shadow-sm': elevation == 1,
        'shadow-md': elevation == 2,
        'shadow-lg': elevation == 3,
        'shadow-xl': elevation == 4,
        'relative before:absolute before:bottom-0 before:left-0 before:bg-primary-500 before:h-1 before:animate-[running-progress_2s_cubic-bezier(0.4,_0,_0.2,_1)_infinite]': loading,
        'cursor-pointer': $attrs.onClick != undefined || link != undefined,
        'backdrop-blur-sm': !noFilter,
        'safari-backdrop-none': elevation > 1,
      }"
      class="h-full flex flex-col rounded-2xl"
      @click="onClick"
      @click.capture="onClickCaptured"
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
          'grid-cols-[auto_1fr_auto]': 'icon' in $slots || icon != undefined,
          'grid-cols-[1fr_auto]': !('icon' in $slots || icon != undefined),
          'cursor-pointer': $attrs.onClickHeader != undefined,
        }]"
        class="shrink-0 grid items-center overflow-hidden"
        @click="onClickHeader"
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
            :id="id"
            :class="{
              'text-lg leading-snug': !dense,
              'text-sm leading-tight': dense,
            }"
          >
            <template v-if="titleLink != undefined || link != undefined">
              <component
                :is="linkComponent"
                :to="titleLink || link"
                @click.stop
              >
                {{ title }}
              </component>
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
                :is="linkComponent"
                :to="subtitleLink"
                @click.stop
              >
                {{ subtitle }}
              </component>
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
          'bg-cover bg-center relative z-10 after:block after:absolute after:top-0 after:left-0 after:w-full after:h-full after:backdrop-filter-[brightness(50%)_grayscale(25%)] after:-z-1': background != undefined,
          'px-6': !dense,
          'pt-4': background == undefined && !dense && !renderTitle,
          'pb-4': background == undefined && !dense && !('actions' in $slots),
          'py-2': background != undefined && !dense,
          'px-3 py-1': dense,
          'rounded-t-2xl after:rounded-t-2xl': !renderTitle,
          'rounded-b-2xl after:rounded-b-2xl': !('actions' in $slots),
        }]"
        :style="{
          'background-image': background != undefined ? `url('${background}')` : undefined,
        }"
        class="block h-full text-text/75"
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
import { defineComponent, computed, inject, useId } from 'vue'
import { KlickerConfigInjectionKey } from '../../composables/klicker'

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
  },
  setup(props, { slots, attrs }) {
    const renderTitle = computed(() => props.title != undefined || props.icon != undefined || 'preview' in slots)
    const klickerConfig = inject(KlickerConfigInjectionKey, undefined)

    const linkComponent = computed(() => klickerConfig?.linkComponent ?? 'a')

    const onClickCaptured = (e: Event) => {
      if (attrs.onClick != undefined) {
        e.stopPropagation();
        (<any> attrs).onClick()
        return
      }
    }

    const onClick = async (e: Event) => {
      if (props.link != undefined) {
        e.stopPropagation()
        await klickerConfig?.navigate(props.link)
        return
      }
    }

    const onClickHeader = (e: Event) => {
      if (attrs.onClickHeader != undefined) {
        e.stopPropagation();
        (<any>attrs).onClickHeader()
        return
      }
    }

    const id = useId()

    return {
      onClick,
      onClickHeader,
      onClickCaptured,
      renderTitle,
      linkComponent,
      id,
    }
  },
})
</script>

<style>
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

/* Safari does not seem to support blur on blur */
_::-webkit-full-page-media, _:future, :root .safari-backdrop-none {
  backdrop-filter: none !important;
}
</style>
