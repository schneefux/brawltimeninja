<template>
  <page-dashboard title="Gadget Tier List">
    <p>
      Use the Gadget Tier List to find the best Gadget for all Brawlers in Brawl Stars. <br />
      The statistics are calculated as the difference between a Brawler with one Gadget and a Brawler with zero Gadgets.
    </p>

    <meta-views
      class="mt-4"
      default-cube="gadget"
    ></meta-views>
  </page-dashboard>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  head() {
    const description = `Brawl Stars Gadget Tier List. Find the best Gadgets for all Brawlers with Win Rates and Rankings.`
    return {
      title: `Gadget Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Gadgets',
  },
  middleware: ['cached'],
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
})
</script>
