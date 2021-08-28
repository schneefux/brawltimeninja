<template>
  <input
    v-if="'playerName' in value"
    type="text"
    v-model.lazy="nameFilter"
    placeholder="Player Name Pattern"
    class="rounded font-semibold text-sm py-1 pl-2 border-2 form-input bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 text-gray-200"
  >
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  computed: {
    nameFilter: {
      get(): string {
        return (this.value.playerName || [])[0]
      },
      set(v: string) {
        if (v == '') {
          this.$parent.$emit('slice', { playerName: [] })
        } else {
          this.$parent.$emit('slice', { playerName: [v] })
        }
      }
    },
  }
})
</script>
