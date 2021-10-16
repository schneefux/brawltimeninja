<template>
  <div class="flex justify-center">
    <b-button
      :class="['w-8 text-center', {
        'hidden': page == 0,
        'mr-10': page == pages,
        'mr-1': page < pages,
      }]"
      primary
      @click="page--"
    >
      <font-awesome-icon
        :icon="faCaretLeft"
      ></font-awesome-icon>
    </b-button>

    <b-button
      class="w-8 text-center"
      :class="['w-8 text-center', {
        'hidden': page == pages,
        'ml-10': page == 0,
        'ml-1': page > 0,
      }]"
      primary
      @click="page++"
    >
      <font-awesome-icon
        :icon="faCaretRight"
      ></font-awesome-icon>
    </b-button>
  </div>
</template>

<script lang="ts">
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import Vue from 'vue'
import BButton from '~/klicker/components/ui/b-button.vue'

export default Vue.extend({
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
  computed: {
    page: {
      get(): number {
        return this.value
      },
      set(p: number) {
        this.$emit('input', p)
      }
    },
    faCaretLeft() {
      return faCaretLeft
    },
    faCaretRight() {
      return faCaretRight
    },
  }
})
</script>
