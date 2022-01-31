<template>
  <page
    :title="$t('tier-list.gear.title')"
    class="container"
  >
    <accessory-tier-list kind="gears"></accessory-tier-list>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  middleware: ['cached'],
  head() {
    const description = this.$t('tier-list.gear.meta.description') as string
    return {
      title: this.$t('tier-list.gear.meta.title') as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Gears',
    screen: 'brawlers',
  },
})
</script>
