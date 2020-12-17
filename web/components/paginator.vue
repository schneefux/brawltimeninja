<template>
  <div class="flex justify-center space-x-2">
    <b-button
      v-if="page > 0"
      class="w-8 text-center"
      primary
      @click="page--"
    >
      <font-awesome-icon
        :icon="faCaretLeft"
      ></font-awesome-icon>
    </b-button>
    <div
      v-else
      class="w-8"
    ></div>

    <b-button
      v-if="page < pages"
      class="w-8 text-center"
      primary
      @click="page++"
    >
      <font-awesome-icon
        :icon="faCaretRight"
      ></font-awesome-icon>
    </b-button>
    <div
      v-else
      class="w-8"
    ></div>
  </div>
</template>

<script lang="ts">
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import Vue from 'vue'

export default Vue.extend({
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
