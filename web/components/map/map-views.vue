<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-2 grid-rows-1 justify-items-center"
    :class="{
      'xl:grid-cols-4': showMapImageCard,
      'xl:grid-cols-3': !showMapImageCard,
    }"
  >
    <card
      v-if="id != undefined"
      md
      class="row-span-2"
    >
      <div
        slot="content"
        class="flex justify-center"
      >
        <media-img
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'image'),
            once: true,
          }"
          :path="id != 0 ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
          size="512"
          clazz="h-80 md:h-120"
        ></media-img>
      </div>
    </card>

    <map-best-brawlers-table
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'brawlers'),
        once: true,
      }"
      :mode="mode"
      :map="map"
      class="row-span-2"
      full-height
      md
    ></map-best-brawlers-table>

    <map-best-teams-table
      v-if="mode != 'soloShowdown'"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'teams'),
        once: true,
      }"
      :mode="mode"
      :map="map"
      class="row-span-2"
      full-height
      md
    ></map-best-teams-table>

    <map-best-players-table
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'leaderboard'),
        once: true,
      }"
      :mode="mode"
      :map="map"
    ></map-best-players-table>
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
