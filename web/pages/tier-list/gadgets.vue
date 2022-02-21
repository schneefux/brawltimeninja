<template>
  <b-page
    :title="$t('tier-list.gadget.title')"
    class="container"
  >
    <accessory-tier-list kind="gadgets"></accessory-tier-list>
  </b-page>
  </b-page>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  middleware: ['cached'],
  head() {
    const description = this.$t('tier-list.gadget.meta.description') as string
    return {
      title: this.$t('tier-list.gadget.meta.title') as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Gadgets',
    screen: 'brawlers',
  },
})
</script>
