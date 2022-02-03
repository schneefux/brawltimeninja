<template>
  <event-card
    :mode="battle.event.mode"
    :map="battle.event.map"
    :id="battle.event.id"
    :elevation="2"
    full-height
  >
    <div
      slot="infobar"
      class="mx-4 flex justify-between"
    >
      <div>
        <span class="mr-2">
          {{ battle.result }}
        </span>
        <span
          v-if="battle.trophyChange != undefined"
          class="font-semibold"
        >
          {{ battle.trophyChange > 0 ? '+' : ''}}{{ battle.trophyChange }}
          <img
            :src="isPowerplay ? require('~/assets/images/icon/power_play_optimized.png') : require('~/assets/images/icon/trophy_optimized.png')"
            class="w-4 inline"
          />
        </span>
      </div>
      <span>
        {{ hoursSinceBattle == 0 ? 'just now' : (hoursSinceBattle + 'h ago') }}
      </span>
    </div>

    <div
      slot="content"
      class="flex flex-wrap justify-center -mx-4 h-full items-center"
    >
      <div
        v-for="(team, index) in battle.teams"
        :key="index"
        :class="'flex flex-wrap justify-center z-10 my-1 '
          + (battle.teams.length == 3 ? 'mt-8 ' : '')
          + (team.length == 2 ? 'mx-1 rounded-sm flex-col ' : '')
        "
      >
        <router-link
          v-for="mate in team"
          :key="mate.tag"
          :rel="mate.brawlerTrophies == undefined || mate.brawlerTrophies < 400 ? 'nofollow' : ''"
          :to="localePath(`/profile/${mate.tag}`)"
          :class="'w-14 h-14 bg-gray-800 py-px relative overflow-hidden '
            + (mate.tag == playerTag ? 'border-2 border-gray-300 ' : '')
            + (team.length != 2 ? 'mx-1 rounded-sm ' : '')
          "
        >
          <media-img
            :path="'/brawlers/' + mate.brawler + '/avatar'"
            size="160"
            clazz="h-8"
          ></media-img>
          <div class="absolute top-0 right-0 w-12 text-right m-px">
            <template v-if="mate.brawlerTrophies != undefined">
              <div class="w-full flex">
                <span
                  class="w-8 text-xs font-semibold text-shadow text-white"
                >
                  {{ mate.brawlerTrophies }}
                </span>
                <img
                  :src="isPowerplay ? require('~/assets/images/icon/power_play_optimized.png') : require('~/assets/images/icon/trophy_optimized.png')"
                  class="w-4 h-4 ml-px"
                />
              </div>
            </template>
            <div class="w-full">
              <span v-if="mate.isBigbrawler" class="text-sm">💀</span>
            </div>
          </div>
          <span
            :class="['text-xs whitespace-nowrap m-px', {
              'text-yellow-400': mate.tag != playerTag,
            }]">
              {{ mate.name }}
            </span>
          </router-link>
      </div>
    </div>
  </event-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { hoursSinceDate } from '~/lib/util'
import { Battle } from '~/model/Api'

export default Vue.extend({
  props: {
    battle: {
      type: Object as PropType<Battle>,
      required: true,
    },
    playerTag: {
      type: String,
      required: true,
    },
  },
  computed: {
    isPowerplay(): boolean {
      // TODO receive this from backend
      return this.battle.victory != undefined && this.battle.trophyChange != undefined
        && (this.battle.victory && this.battle.trophyChange > 11 || !this.battle.victory && this.battle.trophyChange > 3)
    },
    hoursSinceBattle(): number {
      return hoursSinceDate(this.battle.timestamp as string)
    },
  },
})
</script>
