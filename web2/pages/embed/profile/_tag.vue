<template>
  <player-sharepic
    v-if="player != undefined"
    :player="player"
    :win-rate="winRate"
    :total-battles="totalBattles"
    :account-rating="accountRating"
    class="sharepic"
  ></player-sharepic>
</template>

<script lang="ts">
import { useCacheHeaders, useCspHeaders } from '@/composables/compat'
import { useLoadAndValidatePlayer } from '@/composables/player'
import { useBrawlstarsStore } from '@/stores/brawlstars'
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ratingPercentiles } from '~/lib/util'
import PlayerSharepic from '@/components/player/player-sharepic.vue'

export default defineComponent({
  components: {
    PlayerSharepic,
  },
  async setup() {
    useCspHeaders()
    useCacheHeaders()

    const store = useBrawlstarsStore()
    const player = computed(() => store.player!)
    const winRate = computed(() => store.playerTotals!.winRate)
    const totalBattles = computed(() => store.playerTotals!.picks)
    const totalBrawlers = computed(() => store.totalBrawlers)

    const accountRating = computed<string>(() => {
      if (player.value == undefined) {
        return '?'
      }

      const brawlerTrophies = [...Object.values(player.value.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      const trophiesGoal = medBrawlerTrophies * totalBrawlers.value
      const medTrophies = trophiesGoal / totalBrawlers.value
      for (const key in ratingPercentiles) {
        if (medTrophies <= ratingPercentiles[key as keyof typeof ratingPercentiles][1]) {
          return key
        }
      }
      return '?'
    })

    const route = useRoute()
    await useLoadAndValidatePlayer(computed(() => route.params.tag as string), '/embed/profile/')

    return {
      player,
      winRate,
      totalBattles,
      accountRating,
    }
  },
})
</script>

<style lang="postcss" scoped>
.sharepic {
  width: 600px;
  height: 315px;
}
</style>

<route>
{
  meta: {
    layout: 'empty',
  },
}
</route>
