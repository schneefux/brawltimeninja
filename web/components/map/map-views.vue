<template>
  <c-dashboard
    v-model="state"
    elevation="2"
  >
    <template v-slot:slices="data">
      <s-season v-bind="data"></s-season>
      <s-trophies v-bind="data"></s-trophies>
      <s-powerplay v-bind="data"></s-powerplay>
    </template>

    <template v-slot:totals="data">
      <div class="w-full flex flex-wrap">
        <v-sample-size v-bind="data"></v-sample-size>
        <v-last-update v-bind="data"></v-last-update>
      </div>
    </template>

    <template v-slot="state">
      <div
        class="grid grid-cols-1 lg:grid-cols-2 justify-items-center"
        :class="{
          '2xl:grid-cols-4': id != undefined,
          '2xl:grid-cols-3': id == undefined,
        }"
      >
        <card
          v-if="id != undefined"
          :title="$t('map.' + id)"
          md
        >
          <div
            slot="content"
            class="flex flex-wrap justify-center"
          >
            <p class="w-full">{{ $t('tier-list.map.last-online', { time: lastOnlineString }) }}</p>
            <media-img
              v-observe-visibility="{
                callback: (v, e) => trackScroll(v, e, 'image'),
                once: true,
              }"
              :path="id != 0 ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
              size="512"
              clazz="h-auto"
            ></media-img>
          </div>
        </card>

        <map-best-brawlers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'brawlers'),
            once: true,
          }"
          :id="id"
          :slices="state.slices"
          full-height
          md
        ></map-best-brawlers-table>

        <map-best-teams-table
          v-if="mode != 'soloShowdown'"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'teams'),
            once: true,
          }"
          :id="id"
          :slices="state.slices"
          full-height
          md
        ></map-best-teams-table>

        <map-best-players-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'leaderboard'),
            once: true,
          }"
          :id="id"
        :slices="state.slices"
        ></map-best-players-table>
      </div>
    </template>
  </c-dashboard>
</template>

<script lang="ts">
import Vue from 'vue'
import { enUS, de } from 'date-fns/locale'
import { differenceInMinutes, formatDistanceToNow, parseISO } from 'date-fns'
import { getSeasonEnd, State } from '~/lib/cube'
const locales = { en: enUS, de: de }

export default Vue.extend({
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    id: {
      type: String
    },
    timestamp: {
      type: String
    },
    gaCategory: {
      type: String
    },
  },
  data() {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    return {
      state: <State>{
        cubeId: 'battle',
        dimensionsIds: ['brawler'],
        measurementsIds: [],
        slices: {
          season: [currentSeason.toISOString().slice(0, 10)],
          mode: [this.mode],
          map: [this.map],
          trophyRangeGte: ['0'],
          trophyRangeLt: ['10'],
          powerplay: [],
        },
        sortId: 'brawler',
        comparing: false,
      },
    }
  },
  watch: {
    mode() {
      this.state.slices.mode = [this.mode]
    },
    map() {
      this.state.slices.map = [this.map]
    }
  },
  computed: {
    lastOnlineString(): string {
      if (this.timestamp == undefined) {
        return ''
      }
      const date = parseISO(this.timestamp)
      if (differenceInMinutes(new Date(), date) < 60) {
        return this.$tc('state.event-active')
      }
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: locales[this.$i18n.locale],
      })
    },
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

<style lang="postcss" scoped>
.col-span-full {
  grid-column: 1 / -1;
}
</style>
