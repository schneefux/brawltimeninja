<template>
  <!-- always wrap in <client-only> -->
  <div class="contents">
    <slot v-if="activeVariant == '0'"></slot>
    <slot
      v-else
      :name="activeVariant"
    ></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    experimentId: {
      type: String,
      required: true
    },
    debug: {
      type: String
    },
  },
  data() {
    return {
      activeVariant: this.debug || '0',
      callback: undefined as ((v: string) => void)|undefined,
    }
  },
  created() {
    if (process.client) {
      this.callback = (value) => {
        console.log('enabling variant ' + value + ' for experiment ' + this.experimentId)
        this.$set(this, 'activeVariant', value)
      }
      this.$gtag.event('optimize.callback', {
        name: this.experimentId,
        callback: this.callback,
      })
    }
  },
  destroyed() {
    if (process.client && this.callback != undefined) {
      this.$gtag.event('optimize.callback', {
        name: this.experimentId,
        callback: this.callback,
        remove: true,
      })
    }
  },
})
</script>
