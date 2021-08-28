<template>
  <b-button
    v-if="supportsShareApi"
    slot="content"
    class="my-1"
    secondary
    sm
    @click="share()"
  >
    Share
  </b-button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
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
      return global.navigator != undefined && 'share' in navigator
    },
  },
})
</script>
