<template>
  <input
    type="text"
    v-model.lazy="tagFilter"
    placeholder="Player Tag"
    class="bg-white/5 hover:bg-white/10 form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none focus:ring-0"
  >
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { idToTag, tagPattern, tagToId } from '~/lib/util'

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    onInput: {
      type: Function as PropType<SliceValueUpdateListener>,
      required: true
    },
  },
  setup(props) {
    const tagFilter = computed({
      get(): string {
        return idToTag((props.modelValue.playerId ?? [])[0] ?? '')
      },
      set(v: string) {
        if (v == '') {
          props.onInput({ playerId: [] })
        } else {
          if (tagPattern.test(v)) {
            props.onInput({ playerId: [tagToId(v)] })
          }
        }
      }
    })

    return {
      tagFilter,
    }
  },
})
</script>
