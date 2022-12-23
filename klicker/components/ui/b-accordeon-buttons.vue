<template>
  <div
    v-if="pages > 0"
    class="w-full flex justify-end space-x-2"
  >
    <b-button
      v-if="modelValue > 0"
      primary
      sm
      @click="collapse"
    >
      {{ translate('action.collapse') }}
    </b-button>
    <b-button
      v-if="modelValue < Math.ceil(pages) - 1"
      primary
      sm
      @click="expand"
    >
      {{ translate('action.expand') }}
    </b-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BButton from './b-button.vue'
import { useKlicker } from '../../composables/klicker'

export default defineComponent({
  components: {
    BButton,
  },
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    pages: {
      type: Number,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: Number) { return true },
  },
  setup(props, { emit }) {
    const expand = () => emit('update:modelValue', props.modelValue + 1)
    const collapse = () => emit('update:modelValue', 0)
    const { translate } = useKlicker()

    return {
      expand,
      collapse,
      translate,
    }
  },
})
</script>
