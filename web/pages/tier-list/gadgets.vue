<template>
  <page :title="$t('tier-list.gadget.title')">
    <map-breadcrumbs gadgets></map-breadcrumbs>
    <p>{{ $t('tier-list.gadget.description') }}</p>

    <div class="flex flex-wrap justify-center">
      <best-gadgets-table
        full-height
        lg
      ></best-gadgets-table>
    </div>
  </page>
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
