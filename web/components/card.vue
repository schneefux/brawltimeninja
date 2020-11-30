<template functional>
  <div
    class="card-wrapper"
    :class="[data.class, data.staticClass, props.size, {
      'w-full xs:w-xs': props.xs,
      'w-full sm:w-sm': props.sm,
      'w-full md:w-md': props.md,
      'w-full lg:w-lg': props.lg,
      'w-full xl:w-xl': props.xl,
      'w-full 2xl:w-2xl': props.xxl,
    }]"
  >
    <accordeon
      v-if="props.pages != undefined"
      :pages="props.pages"
      :class="['card', {
        'h-full': props.fullHeight,
        'card--dark': !props.light,
        'card--light': props.light,
        'card--loading': props.loading,
      }]"
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
      :class="['card', {
        'h-full': props.fullHeight,
        'card--dark': !props.light,
        'card--light': props.light,
        'card--loading': props.loading,
      }]"
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
    light: {
      type: Boolean
    },
    loading: {
      type: Boolean
    },
    size: {
      type: String, // class
      default: ''
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
    fullHeight: {
      type: Boolean
    },
  },
})
</script>

<style lang="postcss" scoped>
@responsive {
  .w-xs {
    width: 20rem;
  }

  .w-sm {
    width: 24rem;
  }

  .w-md {
    width: 28rem;
  }

  .w-lg {
    width: 32rem;
  }

  .w-xl {
    width: 36rem;
  }

  .w-2xl {
    width: 38rem;
  }
}
</style>
