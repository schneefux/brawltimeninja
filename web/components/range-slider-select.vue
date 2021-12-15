<template>
  <fake-select>
    <span slot="preview" class="w-full text-left">
      {{ format(value[0]) }}-{{ format(value[1]) }}
      {{ name }}
    </span>

    <client-only>
      <vue-range-slider
        :min="min"
        :max="max"
        :step="1"
        :min-range="minRange"
        :value="value"
        :bg-style="bgStyle"
        :process-style="processStyle"
        class="mt-8"
        tooltip-dir="top"
        lazy
        @input="e => onInput(e)"
      >
        <template v-slot:tooltip="{ value }">
          <span class="slider-tooltip !bg-gray-600 !border-gray-600">
            {{ Array.isArray(value) ? `${format(value[0])} - ${format(value[1])}` : format(value) }}
          </span>
        </template>
      </vue-range-slider>
    </client-only>
  </fake-select>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
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
    const onInput = (e: number[]) => {
      if (JSON.stringify(e) != JSON.stringify(props.value)) {
        emit('input', e)
      }
    }

    const bgStyle = {
      backgroundColor: 'rgb(253, 230, 138)', // yellow-200
    }
    const processStyle = {
      backgroundColor: 'rgb(251, 191, 36)', // yellow-400
    }

    return {
      onInput,
      bgStyle,
      processStyle,
    }
  },
})
</script>
