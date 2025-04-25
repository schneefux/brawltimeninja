<template>
  <b-fake-select>
    <template v-slot:preview>
      <span class="w-full text-left">
        {{ format(modelValue[0]) }}-{{ format(modelValue[1]) }}
        {{ name }}
      </span>
    </template>

    <client-only>
      <div class="mt-8 w-56 px-4 pt-1">
        <b-range-slider
          v-model="value"
          :min="min"
          :max="max"
          :step="1"
          :min-range="minRange"
          tooltip-dir="top"
          lazy
        >
          <template v-slot:tooltip="{ value }">
            <span class="slider-tooltip bg-gray-600! border-gray-600!">
              {{ Array.isArray(value) ? `${format(value[0])} - ${format(value[1])}` : format(value) }}
            </span>
          </template>
        </b-range-slider>
      </div>
    </client-only>
  </b-fake-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { BFakeSelect, BRangeSlider } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BRangeSlider,
    BFakeSelect,
  },
  props: {
    modelValue: {
      type: Array as PropType<number[]>,
      required: true,
    },
    name: {
      type: String,
      default: ''
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      required: true
    },
    minRange: {
      type: Number,
      default: 1
    },
    format: {
      type: Function as PropType<(n: number|undefined) => string>,
      default: (n: number|undefined) => n != undefined ? n.toString() : '?'
    },
  },
  setup(props, { emit }) {
    const value = computed({
      get() {
        return props.modelValue
      },
      set(e: number[]) {
        if (JSON.stringify(e) != JSON.stringify(props.modelValue)) {
          emit('update:modelValue', e)
        }
      }
    })

    const isClient = !import.meta.env.SSR

    return {
      value,
      isClient,
    }
  },
})
</script>
