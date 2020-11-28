<template>
  <div
    v-if="!$fetchState.pending"
    class="w-full"
  >
    <div class="card bg-gray-800 card__content relative">
      <button
        class="absolute top-0 right-0 mr-2 text-primary-lighter text-xl"
        @click="$emit('close')"
      >
        &times;
      </button>

      <nuxt-link
        :to="`/player/${player.tag}`"
        class="card__header"
      >
        <media-img
          :path="`/avatars/${player.icon.id}`"
          clazz="h-8 inline mr-1"
        ></media-img>
        <span class="text-primary-lighter">{{ player.name }}</span>
      </nuxt-link>

      <div class="flex justify-between items-center">
        <p class="text-sm">
          Battle Log: <span class="text-green-500 font-semibold">{{ wins }}W</span> / <span class="text-red-500 font-semibold">{{ losses }}L</span>
        </p>
        <nuxt-link
          :to="`/player/${player.tag}`"
          class="card__action button--xs"
        >
          Open Profile
        </nuxt-link>
      </div>
      <nuxt-link
        :to="`/player/${player.tag}`"
        class="block mt-1"
      >
        <player-battles-squares
          :battles="player.battles"
          :tease="true"
        ></player-battles-squares>
      </nuxt-link>

      <p class="mt-4 text-sm">
        Recommendations based on Brawler Trophies and current Map Tier Lists:
      </p>
      <div class="pl-4 -mx-6 flex overflow-x-auto">
        <lazy
          v-for="(event, index) in events"
          :key="event.battle_event_mode + event.battle_event_map"
          :render="index <= 2"
          class="mx-2"
          distance="600px"
        >
          <div class="w-80" style="height: 120px" slot="placeholder"></div>
          <quick-tip-card
            :mode="event.battle_event_mode"
            :map="event.battle_event_map"
            :id="event.battle_event_id"
            :player="player"
          ></quick-tip-card>
        </lazy>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { EventMetadata } from '~/plugins/clicker'
import { decapitalizeFirstLetter, isSpecialEvent } from '../lib/util'
import { CurrentAndUpcomingEvents, Player } from '../model/Api'

export default Vue.extend({
  props: {
    playerTag: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      show: true,
      events: [] as EventMetadata[],
      player: {} as Player,
    }
  },
  async fetch() {
    this.player = await this.$axios.$get('/api/player/' + this.playerTag) as Player

    const modePopularity = this.player.battles.reduce((map, b) => ({
      ...map,
      [b.event.mode]: (map[b.event.mode] || 0) + (b.victory ? 1 : 0.5),
    }), {} as Record<string, number>)

    const events = await this.$clicker.queryActiveEvents()
    this.events = events
      .filter(e => !e.battle_event_powerplay && !isSpecialEvent(e.battle_event_mode))
      .sort((e1, e2) => (modePopularity[e2.battle_event_mode] || 0) - (modePopularity[e1.battle_event_mode] || 0))
  },
  computed: {
    wins(): number {
      if (!('battles' in this.player)) {
        return 0
      }
      return this.player.battles.filter(b => b.victory).length
    },
    losses(): number {
      if (!('battles' in this.player)) {
        return 0
      }
      return this.player.battles.filter(b => !b.victory).length
    },
  },
})
</script>
