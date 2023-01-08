<template>
  <button type="button" @click="state.count++">Counter {{ state.count }}</button>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  setup() {
    const state = reactive({ count: 0 })

    return {
      state,
    }
  },
})
</script>
