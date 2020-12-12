<template functional>
  <div
    :class="['p-1', data.class, data.staticClass, props.size, {
      'w-64': props.xxs,
      'w-full max-w-xs': props.xs,
      'w-full max-w-sm': props.sm,
      'w-full max-w-md': props.md,
      'w-full max-w-lg': props.lg,
      'w-full max-w-xl': props.xl,
      'w-full max-w-2xl': props.xxl,
    }]"
  >
    <accordeon
      v-if="props.pages != undefined"
      :pages="props.pages"
    >
      <template v-slot="accordeonSlotProps">
        <!-- pass props and slots down -->
        <card-content v-bind="data.attrs">
          <template
            v-for="(_, slot) of $scopedSlots"
            v-slot:[slot]="slotProps"
          >
            <slot
              v-bind="{ ...slotProps, ...accordeonSlotProps }"
              :name="slot"
            ></slot>
          </template>
        </card-content>
      </template>
    </accordeon>

    <card-content
      v-else
      v-bind="data.attrs"
    >
      <template
        v-for="(_, slot) of $scopedSlots"
        v-slot:[slot]="slotProps"
      >
        <slot
          :name="slot"
          v-bind="slotProps"
          :page="0"
          open
        ></slot>
      </template>
    </card-content>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    pages: {
      type: Number
    },
    loading: {
      type: Boolean
    },
    size: {
      type: String, // class
      default: ''
    },
    xxs: {
      type: Boolean
    },
    xs: {
      type: Boolean
    },
    sm: {
      type: Boolean
    },
    md: {
      type: Boolean
    },
    lg: {
      type: Boolean
    },
    xl: {
      type: Boolean
    },
    xxl: {
      type: Boolean
    },
  },
})
</script>

<style lang="postcss">
/* https://material.io/design/color/dark-theme.html#behavior */
/* scoping this breaks the styles for some reason */
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
</style>

<style lang="postcss" scoped>
.loading {
  @apply relative;
}

.loading:before {
  @apply absolute bottom-0 left-0 bg-primary h-1;

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
