<template>
  <event-card
    :mode="this.mode"
    :map="this.map"
    :id="!large && id != undefined ? id : undefined"
  >
    <!-- large, endDate, startDate are mutually exclusive -->
    <media-img
      v-if="large && id != undefined"
      slot="infobar"
      :path="'/maps/' + this.id"
      size="384"
      clazz="h-48 mx-auto"
      itemprop="image"
    ></media-img>
    <p
      v-if="endDate != undefined"
      slot="infobar"
      class="text-right"
    >
      {{ endDateString }}
    </p>
    <p
      v-if="startDate != undefined"
      slot="infobar"
      class="text-right"
    >
      {{ startDateString }}
    </p>

    <div slot="content" class="brawler-avatars">
      <div v-if="$fetchState.pending" class="brawler-avatars__placeholder" style="height: 87px"></div>
      <div
        v-for="brawler in data"
        :key="brawler.brawler_name"
        class="brawler-avatars__element my-4"
      >
        <nuxt-link
          :to="`/tier-list/brawler/${brawlerId({ name: brawler.brawler_name })}`"
          :router="$router"
          class="brawler-avatar"
        >
          <media-img
            :path="`/brawlers/${brawlerId({ name: brawler.brawler_name })}/avatar`"
            size="160"
            clazz="brawler-avatar__img"
          ></media-img>
          <p class="brawler-avatar__stats">
            {{ metaStatMaps.formatters.winRate(brawler.battle_victory) }}
            &nbsp;
            {{ metaStatMaps.labelsShort.winRate }}
          </p>
        </nuxt-link>
      </div>
    </div>

    <template v-if="link" v-slot:actions>
      <div class="flex justify-end">
        <nuxt-link
          :to="id != undefined ? `/tier-list/map/${id}` : `/tier-list/mode/${camelToKebab(mode)}`"
          class="card__action"
        >
          Open
        </nuxt-link>
      </div>
    </template>
  </event-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { metaStatMaps, brawlerId, camelToKebab } from '../lib/util'
import { parseISO, formatDistance } from 'date-fns'

interface Row {
  brawler_name: string
  battle_victory: number
}

export default Vue.extend({
  props: {
    large: {
      type: Boolean,
      default: false
    },
    link: {
      type: Boolean,
      default: false
    },
    endDate: {
      type: String,
      required: false
    },
    startDate: {
      type: String,
      required: false
    },
    mode: {
      type: String,
      required: true
    },
    map: {
      type: String,
      required: false
    },
    id: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
    camelToKebab() {
      return camelToKebab
    },
    endDateString(): string {
      if (this.endDate == undefined) {
        return ''
      }

      const date = parseISO(this.endDate)
      return 'ends in ' + formatDistance(date, new Date())
    },
    startDateString(): string {
      if (this.startDate == undefined) {
        return ''
      }

      const date = parseISO(this.startDate)
      return 'starts in ' + formatDistance(date, new Date())
    },
  },
  async fetch() {
    const data = await this.$clicker.query('meta.map.widget', 'map',
      ['brawler_name'],
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlices('synergy'),
        ...(this.map != undefined ? {
          battle_event_map: [this.map],
        } : {}),
        battle_event_mode: [this.mode],
      },
      {
        sort: { battle_victory: 'desc' },
        limit: 5,
        cache: 60*30,
      })
    this.data = data.data as any
  },
})
</script>
