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
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/klicker'
import { tagToId } from '~/lib/util'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  computed: {
    tagFilter: {
      get(): string {
        return (this.value.playerTag || [])[0]
      },
      set(v: string) {
        if (v == '') {
          this.$parent.$emit('slice', { playerId: [] })
        }
        if (new RegExp('^[0289PYLQGRJCUV]{3,}$').test(v)) {
          this.$parent.$emit('slice', { playerId: [tagToId(v)] })
        }
      }
    },
  }
})
</script>
