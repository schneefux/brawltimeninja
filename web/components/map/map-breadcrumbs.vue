<template>
  <ol
    class="flex flex-wrap space-x-2 my-1"
    itemtype="https://schema.org/BreadcrumbList"
    itemscope
  >
    <!-- TODO: refactor -->
    <li
      itemprop="itemListElement"
      itemtype="https://schema.org/ListItem"
      itemscope
    >
      <b-button
        :to="localePath('/tier-list/brawler')"
        itemid="/tier-list/brawler"
        itemtype="https://schema.org/WebPage"
        itemprop="item"
        itemscope
        xs
        primary
      >
        <span itemprop="name">{{ $tc('brawler', 2) }}</span>
      </b-button>
      <meta itemprop="position" content="1" />
    </li>
    <li
      v-if="brawlerId != undefined"
      itemprop="itemListElement"
      itemtype="https://schema.org/ListItem"
      itemscope
    >
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        :to="localePath(`/tier-list/brawler/${brawlerId}`)"
        :itemid="`/tier-list/brawler/${brawlerId}`"
        itemtype="https://schema.org/WebPage"
        itemprop="item"
        itemscope
        xs
        dark
      >
        <span itemprop="name">{{ brawlerName }}</span>
      </b-button>
      <meta itemprop="position" content="2" />
    </li>
    <li
      v-if="mode != undefined"
      itemprop="itemListElement"
      itemtype="https://schema.org/ListItem"
      itemscope
    >
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        :to="localePath(`/tier-list/mode/${modePath}`)"
        :itemid="`/tier-list/mode/${modePath}`"
        :primary="map != undefined"
        :dark="map == undefined"
        itemtype="https://schema.org/WebPage"
        itemprop="item"
        itemscope
        xs
      >
        <span itemprop="name">{{ $t('mode.' + mode) }}</span>
      </b-button>
      <meta itemprop="position" content="2" />
    </li>
    <li
      v-if="map != undefined"
      itemprop="itemListElement"
      itemtype="https://schema.org/ListItem"
      itemscope
    >
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        :to="localePath(`/tier-list/mode/${modePath}/map/${mapPath}`)"
        :itemid="`/tier-list/mode/${modePath}/map/${mapPath}`"
        itemtype="https://schema.org/WebPage"
        itemprop="item"
        itemscope
        xs
        dark
      >
        <span itemprop="name">{{ id != 0 ? $t('map.' + id) : map }}</span>
      </b-button>
      <meta itemprop="position" content="3" />
    </li>
    <li
      v-if="starpowers"
      itemprop="itemListElement"
      itemtype="https://schema.org/ListItem"
      itemscope
    >
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        :to="localePath('/tier-list/starpowers')"
        itemid="/tier-list/starpowers"
        itemtype="https://schema.org/WebPage"
        itemprop="item"
        itemscope
        xs
        dark
      >
        <span itemprop="name">{{ $tc('starpower', 2) }}</span>
      </b-button>
      <meta itemprop="position" content="2" />
    </li>
    <li
      v-if="gadgets"
      itemprop="itemListElement"
      itemtype="https://schema.org/ListItem"
      itemscope
    >
      <font-awesome-icon :icon="faCaretRight"></font-awesome-icon>
      <b-button
        :to="localePath('/tier-list/gadgets')"
        itemid="/tier-list/gadgets"
        itemtype="https://schema.org/WebPage"
        itemprop="item"
        itemscope
        xs
        dark
      >
        <span itemprop="name">{{ $tc('gadget', 2) }}</span>
      </b-button>
      <meta itemprop="position" content="2" />
    </li>
  </ol>
</template>

<script lang="ts">
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
import Vue from 'vue'
import { camelToKebab, slugify } from '~/lib/util'

export default Vue.extend({
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    id: {
      type: [Number, String]
    },
    starpowers: {
      type: Boolean
    },
    gadgets: {
      type: Boolean
    },
    brawlerId: {
      type: String
    },
    brawlerName: {
      type: String
    },
  },
  computed: {
    modePath() {
      return camelToKebab(this.mode)
    },
    mapPath() {
      return slugify(this.map)
    },
    faCaretRight() {
      return faCaretRight
    },
  },
})
</script>
