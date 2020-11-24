<template>
  <event-card
    :mode="mode"
    :map="map"
    :size="horizontal ? 'w-160 md:w-auto' : ''"
    nobackground
  >
    <div
      slot="content"
      class="flex flex-wrap justify-evenly items-center"
    >
      <media-img
        v-if="id != undefined && id != 0"
        :path="`/maps/${id}`"
        size="512"
        clazz="h-64"
      ></media-img>
      <img
        v-if="staticImageUrl != undefined"
        :src="staticImageUrl"
        style="max-height: 16rem"
      >

      <div>
        <dl
          v-if="timestamp != undefined"
          class="darkbox stat flex justify-between"
        >
          <dt class="text-left font-semibold mr-1">
            Last Online:
          </dt>
          <dd class="text-right ml-1">
            {{ lastOnlineString }}
          </dd>
        </dl>

        <map-balance-score
          :mode="mode"
          :map="map"
          :season="season"
          class="darkbox stat"
        ></map-balance-score>

        <div class="darkbox stat">
          <div class="text-lg font-semibold text-center">
            Best Brawlers
          </div>
          <map-best-brawlers
            :mode="mode"
            :map="map"
            :season="season"
            class="mt-2 mb-1"
          ></map-best-brawlers>
        </div>

        <div
          v-if="mode != 'soloShowdown'"
          class="darkbox stat"
        >
          <div class="text-lg font-semibold text-center">
            Teams with most Wins
          </div>
          <map-best-teams
            :mode="mode"
            :map="map"
            :season="season"
            class="mt-2 mb-1"
          ></map-best-teams>
        </div>
      </div>
    </div>

    <div v-if="link" slot="actions" class="flex justify-end">
      <router-link
        :to="linkTarget"
        class="card__action"
      >
        Open
      </router-link>
    </div>
  </event-card>
</template>

<script lang="ts">
import { differenceInMinutes, formatDistanceToNow, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
import { camelToKebab, slugify } from '~/lib/util'

export default Vue.extend({
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      type: [String, Number],
    },
    timestamp: {
      type: String,
    },
    season: {
      type: String,
    },
    link: {
      type: Boolean,
      default: false
    },
    horizontal: {
      // force horizontal layout on mobile
      type: Boolean,
      default: false
    },
  },
  computed: {
    staticImageUrl(): string|undefined {
      if (this.map.startsWith('Competition Winner ')) {
        const id = this.map!.replace('Competition Winner ', '')
        return `/images/maps/${id}.jpg`
      } else {
        return undefined
      }
    },
    lastOnlineString(): string {
      if (this.timestamp == undefined) {
        return ''
      }
      const date = parseISO(this.timestamp)
      if (differenceInMinutes(new Date(), date) < 60) {
        return 'Active'
      }
      return formatDistanceToNow(date, { addSuffix: true })
    },
    linkTarget(): string {
      if (this.mode == undefined) {
        return '/tier-list/brawler'
      }

      if (this.map == undefined) {
        return `/tier-list/mode/${camelToKebab(this.mode)}`
      }

      return `/tier-list/mode/${camelToKebab(this.mode)}/map/${slugify(this.map)}`
    },
  },
})
</script>

<style lang="postcss" scoped>
.stat {
  @apply mx-2 mt-2;
}
</style>
