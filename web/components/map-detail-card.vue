<template>
  <event-card
    :mode="mode"
    :map="map"
    size=""
    nobackground
  >
    <template v-slot:content>
      <div class="flex flex-wrap justify-center items-center bg-gray-800 px-3 pb-2">
        <media-img
          v-if="id != undefined"
          :path="`/maps/${id}`"
          size="512"
          clazz="h-80 mt-2"
        ></media-img>

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
            class="darkbox stat"
          ></map-balance-score>

          <div class="darkbox stat">
            <div class="text-lg font-semibold text-center">
              Best Brawlers
            </div>
            <map-best-brawlers
              :mode="mode"
              :map="map"
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
              class="mt-2 mb-1"
            ></map-best-teams>
          </div>
        </div>
      </div>
    </template>
  </event-card>
</template>

<script lang="ts">
import { differenceInMinutes, formatDistanceToNow, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'

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
  },
  computed: {
    lastOnlineString(): string {
      if (this.timestamp == undefined) {
        return ''
      }
      const date = parseISO(this.timestamp)
      if (differenceInMinutes(new Date(), date) < 60) {
        return 'Currently Active'
      }
      return formatDistanceToNow(date, { addSuffix: true })
    },
  },
})
</script>

<style lang="postcss" scoped>
.stat {
  @apply mx-2 mt-2;
}
</style>
