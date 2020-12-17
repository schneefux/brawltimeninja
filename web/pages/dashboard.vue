<template>
  <page title="Brawl Stars Meta Dashboard">
    <meta-views
      :default-cube="cube"
      :default-slices="slices"
    ></meta-views>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'

export default Vue.extend({
  head(): MetaInfo {
    return {
      link: [ {
        // do not differentiate by query strings (slices)
        rel: 'canonical',
        href: this.$route.path,
      } ],
    }
  },
  data() {
    return {
      cube: 'map',
      slices: this.$clicker.defaultSlices('map'),
    }
  },
  asyncData({ query, $clicker, route }) {
    const cube = query['cube'] as string || 'map'
    return {
      cube,
      slices: $clicker.routeToSlices(route, $clicker.defaultSlices(cube)),
    }
  },
})
</script>
