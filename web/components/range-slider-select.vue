<template>
  <b-fake-select>
    <span
      slot="preview"
      class="w-full text-left"
    >
      {{ format(value[0]) }}-{{ format(value[1]) }}
      {{ name }}
    </span>

    <client-only>
      <div class="mt-8 w-56 px-4 pt-1">
        <vue-range-slider
          :min="min"
          :max="max"
          :step="1"
          :min-range="minRange"
          :value="value"
          :bg-style="bgStyle"
          :process-style="processStyle"
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
      </div>
    </client-only>
  </b-fake-select>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { BFakeSelect } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BFakeSelect,
  },
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
