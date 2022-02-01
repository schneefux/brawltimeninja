<template>
  <div
    v-if="pages > 0"
    class="w-full flex justify-end space-x-2"
  >
    <b-button
      v-if="value > 0"
      primary
      sm
      @click="collapse"
    >
      {{ $t('action.collapse') }}
    </b-button>
    <b-button
      v-if="value < Math.ceil(pages) - 1"
      primary
      sm
      @click="expand"
    >
      {{ $t('action.expand') }}
    </b-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: Number,
      required: true
    },
    pages: {
      type: Number,
      required: true
    },
  },
  setup(props, { emit }) {
    const expand = () => emit('input', props.value + 1)
    const collapse = () => emit('input', 0)

    return {
      expand,
      collapse,
    }
  },
})
</script>
