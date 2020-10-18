<template>
  <div class="h-8">
    <button
      v-if="!loading"
      @click="trigger"
      class="button button--secondary"
    >Share</button>
    <div v-if="loading">
      <span class="italic text-sm">Generating your Sharepic...</span>
    </div>
    <lazy-sharepic-content
      v-if="loading"
      :debug="debug"
      @done="done"
    >
      <slot></slot>
    </lazy-sharepic-content>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    debug: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    trigger() {
      this.loading = true
    },
    done() {
      this.loading = false
      this.$emit('done')
    },
  },
})
</script>
