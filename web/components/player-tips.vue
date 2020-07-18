<template>
  <div
    v-if="eventRecommendations.length > 0"
    class="section md:mx-4 py-4 px-3"
  >
    <div class="mb-3">
      <div class="text-left text-lg">
        💡
        Play your lowest Brawlers' strengths
      </div>
    </div>
    <p
      v-for="tip in eventRecommendations.slice(0, tipsPage * tipsPageSize)"
      :key="tip.id"
      class="mt-2 px-3"
    >
      {{ tip.phrase }}
      <span class="capitalize text-primary-lighter">
        {{ tip.brawler.toLowerCase() }}
      </span>
      in
      <nuxt-link
        :to="`/tier-list/map/${tip.eventId}`"
        class="link inline-block"
      >
        {{ formatMode(tip.mode) }} - {{ tip.map }}
      </nuxt-link>.
    </p>
    <button
      v-show="tipsPage * tipsPageSize < eventRecommendations.length"
      class="mt-3 button button-sm"
      @click="tipsPage++; $ga.event('tips', 'load_more', tipsPage)"
    >
      Load More Tips
    </button>
    <button
      v-show="notificationsAllowed"
      class="ml-2 button button-sm"
      @click="notifyTips"
    >
      Send as Notification
    </button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { capitalizeWords, getBest, getBestBrawlers, formatMode } from '../lib/util'
import { ActiveEvent } from '../model/Brawlstars'
import { BrawlerMetaStatistics } from '../model/Web'
import { MapMeta, MapMetaMap } from '../model/MetaEntry'
import { Player } from '../model/Api'

interface Recommendation {
  id: string
  phrase: string
  score: number
  brawler: string
  map: string
  mode: string
  eventId: string
}

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      required: true,
    },
  },
  data() {
    return {
      notificationsAllowed: false,
      tipsPage: 1,
      tipsPageSize: 3,
      formatMode,
    }
  },
  created() {
    if ((<any>process).client && 'Notification' in window) {
      this.notificationsAllowed = Notification.permission !== 'denied'
    }
  },
  computed: {
    eventRecommendations(): Recommendation[] {
      const phrases = [
        'Get more trophies by playing',
        'You can push',
        'Try to play',
        'To gain some trophies, play',
        'Other players had success with',
        'You should try',
        'For easy wins, play',
      ]
      const recommendations = [] as Recommendation[]
      const worstBrawlers = Object.values((this.player as Player).brawlers)
        .sort((b1, b2) => b1.trophies - b2.trophies)

      // sort by score =
      // index [ brawlers owned by player, worst first ]
      // *
      // index [ brawler in map meta, best first ]
      Object.entries(this.activeMapMeta).forEach(([id, mapMeta]) => {
        const meta = mapMeta as MapMeta

        const bestBrawlers = getBestBrawlers(Object.values(meta.brawlers)) as BrawlerMetaStatistics[]
        worstBrawlers.forEach((worstBrawler, worstBrawlerIndex) => {
          const bestBrawlerIndex = bestBrawlers.findIndex(b => b.name.toLowerCase() == worstBrawler.name.toLowerCase())
          if (bestBrawlerIndex == -1) {
            return
          }

          const score = (worstBrawler.trophies + 1) * (bestBrawlerIndex / bestBrawlers.length + 1)
          recommendations.push({
            id: `${worstBrawler.name} ${id}`,
            phrase: phrases[Math.round(parseInt(id) / 31) % phrases.length],
            score,
            brawler: worstBrawler.name,
            map: meta.map,
            mode: meta.mode,
            eventId: id,
          })
        })
      })
      recommendations.sort((r1, r2) => r1.score - r2.score)
      return recommendations.slice(0, 20)
    },
  },
  methods: {
    async notifyTips() {
      if (!(Notification.permission in ['denied', 'granted'])) {
        await Notification.requestPermission()
      }

      if (Notification.permission !== 'granted') {
        this.notificationsAllowed = false
        return
      }

      this.$ga.event('profile', 'send_notification', 'tips')
      this.notificationsAllowed = true

      const sw = await navigator.serviceWorker.ready

      const eventDescription = (r: Recommendation) => r.mode + ' - ' + r.map
      const N = 5
      const topNByEvent = (this.eventRecommendations as Recommendation[])
        .reduce((topNByEvent, recommendation) => ({
          ...topNByEvent,
          [eventDescription(recommendation)]: [
            ...(topNByEvent[eventDescription(recommendation)] || []),
            capitalizeWords(recommendation.brawler.toLowerCase())
          ].slice(0, N)
        }), {} as { [description: string]: string[] })
      const tips = [...Object.entries(topNByEvent)]
        .map(([eventDescription, topN]) => 'Play ' + topN.join(', ') + ' in ' + eventDescription)
      sw.showNotification(`Tips for ${this.player.name} by Brawl Time Ninja`, {
        body: tips.join('\n')
      })
    },
  },
})
</script>
