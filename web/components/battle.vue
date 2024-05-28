<template>
  <event-card
    :mode="battle.event.mode"
    :map="battle.event.map"
    :event-id="battle.event.id"
  >
    <template v-slot:infobar>
      <div class="flex justify-between">
        <div>
          <span class="mr-2">{{ battle.result }}</span>
          <span
            v-if="battle.trophyChange != undefined"
            class="font-semibold"
          >
            {{ battle.trophyChange > 0 ? '+' : ''}}{{ battle.trophyChange }}
            <img
              :src="battle.ranked ? powerPlayIcon : trophyIcon"
              class="w-4 inline"
            />
          </span>
        </div>
        <relative-time :timestamp="battle.timestamp" add-suffix></relative-time>
      </div>
    </template>

    <template v-slot:content>
      <div class="flex flex-wrap justify-center -mx-4 h-full items-center">
        <div
          v-for="(team, index) in battle.teams"
          :key="index"
          :class="{
            'mt-8': battle.teams.length == 3,
            'mx-1 rounded-sm flex-col': team.length == 2,
          }"
          class="flex flex-wrap justify-center z-10 my-1"
        >
          <router-link
            v-for="mate in team"
            :key="mate.tag"
            :rel="mate.brawlerTrophies == undefined || mate.brawlerTrophies < 400 ? 'nofollow' : ''"
            :to="localePath(`/profile/${mate.tag}`)"
            :class="{
              'border-2 border-gray-300 ': highlightTags.includes(mate.tag),
              'mx-1 rounded-sm ': team.length != 2,
            }"
            class="w-14 h-16 bg-background/75 p-px relative overflow-hidden text-xs flex flex-col gap-y-px"
            @click.stop
          >
            <span
              v-if="mate.brawlerRank != undefined || mate.brawlerTrophies != undefined"
              class="h-4 flex"
            >
              <img
                class="mr-1 h-4 py-px object-contain"
                :src="mate.brawlerRank ? rankIcons[mate.brawlerRank.league] : trophyIcon"
              >
              {{ mate.brawlerRank?.leagueSub ?? mate.brawlerTrophies }}
              {{ mate.isBigbrawler ? '💀' : '' }}
            </span>
            <media-img
              :path="`/brawlers/${mate.brawler}/avatar`"
              :alt="mate.brawler"
              size="160"
              clazz="h-7 -ml-px object-contain"
            ></media-img>
            <span
              class="h-4 whitespace-nowrap overflow-hidden text-ellipsis"
              :class="{
                'text-primary-400': !highlightTags.includes(mate.tag),
              }">{{ mate.name }}</span>
            </router-link>
        </div>
      </div>
    </template>
  </event-card>
</template>

<script lang="ts">
import { Battle } from '~/model/Api'
import { defineComponent, PropType } from 'vue'
import powerPlayIcon from '~/assets/images/icon/power_play_optimized.png'
import trophyIcon from '~/assets/images/icon/trophy_optimized.png'
import bronzeRankIcon from '~/assets/images/icon/ranks/rank_bronze.png'
import silverRankIcon from '~/assets/images/icon/ranks/rank_silver.png'
import goldRankIcon from '~/assets/images/icon/ranks/rank_gold.png'
import diamondRankIcon from '~/assets/images/icon/ranks/rank_diamond.png'
import mythicRankIcon from '~/assets/images/icon/ranks/rank_mythic.png'
import legendaryRankIcon from '~/assets/images/icon/ranks/rank_legendary.png'
import mastersRankIcon from '~/assets/images/icon/ranks/rank_masters.png'

const rankIcons = {
  'Bronze': bronzeRankIcon,
  'Silver': silverRankIcon,
  'Gold': goldRankIcon,
  'Diamond': diamondRankIcon,
  'Mythic': mythicRankIcon,
  'Legendary': legendaryRankIcon,
  'Masters': mastersRankIcon,
} as const

export default defineComponent({
  props: {
    battle: {
      type: Object as PropType<Battle>,
      required: true,
    },
    /* without hash */
    highlightTags: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  setup() {
    return {
      powerPlayIcon,
      trophyIcon,
      rankIcons,
    }
  },
})
</script>
