<template>
  <input
    type="text"
    v-model.lazy="nameFilter"
    placeholder="Player Name Pattern"
    class="rounded font-semibold text-sm py-1 pl-2 border-2 form-input bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 text-gray-200"
  >
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    onInput: {
      type: Function as PropType<SliceValueUpdateListener>,
      required: true
    },
  },
  setup(props) {
    const nameFilter = computed({
      get(): string {
        return (props.value.playerName || [])[0] || ''
      },
      set(v: string) {
        if (v == '') {
          props.onInput({ playerName: [] })
        } else {
          props.onInput({ playerName: [v] })
        }
      }
    })

    return {
      nameFilter,
    }
  },
})
</script>
