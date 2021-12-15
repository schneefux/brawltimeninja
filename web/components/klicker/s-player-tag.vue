<template>
  <input
    v-if="'playerTag' in value"
    type="text"
    v-model.lazy="tagFilter"
    placeholder="Player Tag"
    class="rounded font-semibold text-sm py-1 pl-2 border-2 form-input bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 text-gray-200"
  >
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { SliceValue, SliceValueUpdateListener } from '~/klicker'
import { tagToId } from '~/lib/util'

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
    const tagFilter = computed({
      get(): string {
        return (props.value.playerTag || [])[0] || ''
      },
      set(v: string) {
        if (v == '') {
          props.onInput({ playerId: [] })
        } else {
          if (new RegExp('^[0289PYLQGRJCUV]{3,}$').test(v)) {
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
