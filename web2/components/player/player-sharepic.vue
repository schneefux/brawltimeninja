<template>
  <div
    class="flex flex-wrap bg-gray-800 px-3 relative"
  >
    <div class="w-full flex items-center">
      <img
        :src="`${$config.mediaUrl}/avatars/${player.icon.id}.png?size=112`"
        class="w-14 mr-4"
      >
      <span class="text-4xl font-semibold relative text-yellow-400">
        {{ player.name }}
      </span>

      <div class="ml-auto flex items-center">
        <span class="text-xl">{{ $t('metric.accountRating.short') }}</span>
        <div
          class="ml-3 border-2 border-red-600 text-yellow-400 font-bold text-4xl rounded-full h-12 w-12 text-center flex justify-center items-center"
        >
          <span class="mb-1">
            {{ accountRating }}
          </span>
        </div>
      </div>
    </div>

    <div class="w-1/2 pr-1">
      <div class="grid grid-cols-2 gap-x-2 items-center">
        <span
          v-if="player.club.tag != undefined"
          class="text-right text-2xl"
        >
          {{ $t('club') }}
        </span>
        <span
          v-if="player.club.tag != undefined"
          class="text-red-500 text-2xl font-semibold"
        >
          {{ player.club.name }}
        </span>

        <span class="text-right text-yellow-400 text-3xl font-bold">
          {{ hours }}
        </span>
        <span class="whitespace-nowrap text-2xl">
          {{ $t('metric.hours-spent') }}
        </span>

        <span class="text-right text-yellow-400 text-3xl font-bold">
          {{ Math.floor(player.trophies) }}
        </span>
        <span class="whitespace-nowrap text-2xl">
          {{ $t('metric.trophies') }}
        </span>
      </div>

      <div
        class="mt-2 -ml-3 pr-3 w-80"
        :class="{
          'h-28': player.club.tag != undefined,
          'h-36': player.club.tag == undefined,
        }"
      >
        <history-graph :player-tag="player.tag">
          <template v-slot:empty><p
            
            class="px-20 pt-12 text-center"
          >
            {{ $t('player.no-history') }}
          </p></template>
        </history-graph>
      </div>
    </div>

    <div class="w-1/2 pl-1">
      <div class="grid grid-cols-2 gap-x-2 items-center">
        <span class="text-3xl text-yellow-400 font-bold text-right">
          {{ Math.floor(winRate * 100) }}%
        </span>
        <div>
          <span class="text-xl block">
            {{ $t('metric.winRate') }}
          </span>
          <span class="text-xs -mt-1 block">
            ({{ totalBattles }} {{ $t('metric.battles-total') }})
          </span>
        </div>

        <span class="text-3xl text-yellow-400 font-bold text-right">
          {{ player['3vs3Victories'] }}
        </span>
        <span class="text-2xl">
          {{ $t('metric.victories') }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-x-2 gap-y-1">
        <div
          v-for="brawler in bestBrawlers.slice(0, 6)"
          :key="brawler.id"
          class="flex items-center h-12"
        >
          <div class="w-full h-full">
            <img
              :src="`${$config.mediaUrl}/brawlers/${brawler.id}/model.png?size=96`"
              class="w-auto h-full mx-auto"
            >
          </div>
          <div class="w-full flex items-center">
            <img
              src="~/assets/images/icon/trophy_optimized.png"
              class="h-5 inline"
            >
            <span class="ml-1 text-xl font-bold">
              {{ brawler.trophies }}
            </span>
          </div>
        </div>
      </div>

      <p class="absolute bottom-0 right-0 mr-2 mb-1 text-xs text-right text-gray-400">
        brawltime.ninja
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Player } from '@/model/Brawlstars'
import { xpToHours } from '~/lib/util'
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    winRate: {
      type: Number,
      required: true
    },
    totalBattles: {
      type: Number,
      required: true
    },
    accountRating: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const hours = computed(() => Math.floor(xpToHours(props.player.expPoints)))
    const bestBrawlers = computed(() => Object.entries(props.player.brawlers)
      .map(([id, brawler]) => ({
        ...brawler,
        id,
      }))
      .sort((b1, b2) => b2.trophies - b1.trophies))

    return {
      hours,
      bestBrawlers,
    }
  },
})
</script>
