<template>
  <ol class="flex flex-wrap space-x-2 my-1">
    <li>
      <b-button
        to="/tier-list/brawler"
        xs
        primary
      >Brawlers</b-button>
    </li>
    <li v-if="brawler != undefined">
      <b-button
        xs
        dark
      >{{ brawlerName }}</b-button>
    </li>
    <li v-if="mode != undefined">
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        :to="`/tier-list/mode/${modePath}`"
        xs
        :primary="map != undefined"
        :dark="map == undefined"
      >{{ modeName }}</b-button>
    </li>
    <li v-if="map != undefined">
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        xs
        dark
      >{{ map }}</b-button>
    </li>
    <li v-if="starpowers">
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        xs
        dark
      >Star Powers</b-button>
    </li>
    <li v-if="gadgets">
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        xs
        dark
      >Gadgets</b-button>
    </li>
  </ol>
</template>

<script lang="ts">
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
import Vue from 'vue'
import { camelToKebab, formatMode } from '~/lib/util'

export default Vue.extend({
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    starpowers: {
      type: Boolean
    },
    gadgets: {
      type: Boolean
    },
    brawler: {
      type: String
    },
  },
  computed: {
    modeName() {
      return formatMode(this.mode)
    },
    modePath() {
      return camelToKebab(this.mode)
    },
    faCaretRight() {
      return faCaretRight
    },
  },
})
</script>
