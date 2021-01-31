<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 justify-items-center"
    :class="{
      'xl:grid-cols-4': showMapImageCard,
      'xl:grid-cols-3': !showMapImageCard,
    }"
  >
    <card
      v-if="showMapImageCard"
      md
      class="row-span-2"
    >
      <div
        slot="content"
        class="flex justify-center"
      >
        <media-img
          v-if="id != undefined && id != 0"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'image'),
            once: true,
          }"
          :path="`/maps/${id}`"
          size="512"
          clazz="h-80 md:h-120"
        ></media-img>
        <img
          v-if="staticImageUrl != undefined"
          :src="staticImageUrl"
          style="max-height: 16rem"
        >
      </div>
    </card>

    <map-brawlers-table
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'brawlers'),
        once: true,
      }"
      :mode="mode"
      :map="map"
      class="row-span-2"
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
      class="row-span-2"
      full-height
      md
    ></map-teams-table>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        class="container flex justify-center"
        ins-class="w-screen md:w-full -mx-4 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4623162753"
      ></adsense>
    </client-only>

    <map-leaderboard-table
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'leaderboard'),
        once: true,
      }"
      :mode="mode"
      :map="map"
      full-height
      md
    ></map-leaderboard-table>
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
    staticImageUrl(): string|undefined {
      if (this.map?.startsWith('Competition Winner ')) {
        const id = this.map!.replace('Competition Winner ', '')
        return process.env.mediaUrl + '/maps/competition-winners/' + id + '.png'
      } else {
        return undefined
      }
    },
    showMapImageCard(): boolean {
      return (this.id != undefined && this.id != 0) || (this.staticImageUrl != undefined)
    },
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
