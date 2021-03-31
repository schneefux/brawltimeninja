<template>
  <page :title="$t('tier-list.starpower.title')">
    <map-breadcrumbs starpowers></map-breadcrumbs>
    <p>{{ $t('tier-list.starpower.description') }}</p>

    <div class="flex flex-wrap justify-center">
      <best-starpowers-table
        full-height
        lg
      ></best-starpowers-table>
    </div>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  middleware: ['cached'],
  head() {
    const description = this.$t('tier-list.starpower.meta.description') as string
    return {
      title: this.$t('tier-list.starpower.meta.title') as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Star Powers',
    screen: 'brawlers',
  },
})
</script>
