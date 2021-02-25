<template>
  <card
    v-if="supportsShareApi"
    v-bind="$attrs"
  >
    <b-button
      slot="content"
      secondary
      sm
      @click="share()"
    >
      Share Link
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  inheritAttrs: false,
  methods: {
    async share() {
      try {
        await navigator.share({
          url: window.location.href,
        })
        this.$gtag.event('click', {
          'event_category': 'dashboard',
          'event_label': 'share',
        })
      } catch (err) {
        console.error(err);
        this.$gtag.event('click', {
          'event_category': 'dashboard',
          'event_label': 'share_error',
        })
      }
    },
  },
  computed: {
    supportsShareApi() {
      return 'share' in navigator
    },
  },
})
</script>
