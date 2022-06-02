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
      {{ translate('action.collapse') }}
    </b-button>
    <b-button
      v-if="value < Math.ceil(pages) - 1"
      primary
      sm
      @click="expand"
    >
      {{ translate('action.expand') }}
    </b-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import BButton from './b-button.vue'
import { useKlicker } from '../../composables/klicker'

export default defineComponent({
  components: {
    BButton,
  },
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
    const { translate } = useKlicker()

    return {
      expand,
      collapse,
      translate,
    }
  },
})
</script>
