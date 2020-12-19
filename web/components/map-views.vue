<template>
  <div class="flex flex-wrap justify-center">
    <map-detail-card
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
      :mode="mode"
      :map="map"
      :id="id"
      :timestamp="timestamp"
      sm
    ></map-detail-card>

    <div>
      <map-leaderboard-card
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'leaderboard'),
          once: true,
        }"
        :mode="mode"
        :map="map"
        sm
      ></map-leaderboard-card>

      <client-only>
        <adsense
          v-if="!isApp && map != undefined"
          data-ad-format="auto"
          data-full-width-responsive="no"
          class="md:w-full max-w-sm"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="4623162753"
        ></adsense>
      </client-only>
    </div>

    <div class="flex flex-wrap justify-center">
      <map-brawlers-table
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'brawlers'),
          once: true,
        }"
        :mode="mode"
        :map="map"
        full-height
        md
      ></map-brawlers-table>

      <map-teams-table
        v-if="mode != 'soloShowdown'"
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'teams'),
          once: true,
        }"
        :mode="mode"
        :map="map"
        full-height
        md
      ></map-teams-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    id: {
      type: Number
    },
    timestamp: {
      type: String
    },
    gaCategory: {
      type: String
    },
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    })
  },
  methods: {
    trackScroll(visible, element, section) {
      if (this.gaCategory != undefined && visible) {
        this.$gtag.event('scroll', {
          'event_category': this.gaCategory,
          'event_label': section,
        })
      }
    },
  },
})
</script>
