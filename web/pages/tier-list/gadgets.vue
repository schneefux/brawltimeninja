<template>
  <page :title="$t('tier-list.gadget.title')">
    <map-breadcrumbs gadgets></map-breadcrumbs>
    <p>{{ $t('tier-list.gadget.description') }}</p>

    <div class="flex flex-wrap justify-center">
      <best-gadgets-table
        full-height
        md
      ></best-gadgets-table>
    </div>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  middleware: ['cached'],
  head() {
    const description = this.$tc('tier-list.gadget.description', 1)
    return {
      title: this.$tc('tier-list.gadget.title', 1),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Gadgets',
  },
})
</script>
