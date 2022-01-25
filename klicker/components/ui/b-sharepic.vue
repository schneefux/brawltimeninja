<template>
  <div class="h-8">
    <b-button
      v-if="!loading"
      secondary
      sm
      @click="trigger"
    >{{ $t('action.share') }}</b-button>
    <div v-if="loading">
      <span class="italic text-sm">{{ $t('state.generating-sharepic') }}...</span>
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
import { defineComponent } from 'vue-demi'

export default defineComponent({
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
