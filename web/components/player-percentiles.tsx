import Vue, { PropType } from 'vue'
import { Player } from '~/model/Api'
import * as ztable from 'ztable'
import playerBattle from './player-battle'

export default Vue.extend({
  functional: true,
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  render(h, { props }) {
    const player = props.player

    // 2020-08-08 highest trophies
    const trophiesMu = 15390
    const trophiesSigma = 5433
    const trophiesZ = (player.stats.highestTrophies - trophiesMu) / trophiesSigma

    // 2020-08-08 highest power play points only considering players with all brawlers
    const ppMu = 835
    const ppSigma = 229
    const ppZ = ((player.stats.highestPowerPlayPoints || 0) - ppMu) / ppSigma

    // 2020-08-08 max highest brawler trophies
    const brawlerMu = 640
    const brawlerSigma = 153
    const maxHighestBrawlerTrophies = Math.max.apply(Object.values(player.brawlers).map(b => b.highestTrophies))
    const brawlerZ = (maxHighestBrawlerTrophies - brawlerMu) / brawlerSigma

    // TODO do not use a normal distribution for these
    // 2020-08-08
    const victoriesMu = 2577
    const victoriesSigma = 2940
    const victoryZ = (player.stats.victories - victoriesMu) / victoriesSigma

    const soloMu = 437
    const soloSigma = 441
    const soloZ = (player.stats.soloVictories - soloMu) / soloSigma

    const duoMu = 698
    const duoSigma = 695
    const duoZ = (player.stats.duoVictories - duoMu) / duoSigma

    // 2020-08-08 championship challenge
    const ccPercentile = player.qualifiedFromChampionshipChallenge ? 0.95 : 0.05

    // TODO create an endpoint?
    const allAchievements = [{
      metric: 'Highest Trophies',
      percentile: ztable(trophiesZ),
    }, {
      metric: 'Highest Power Play Points',
      percentile: ztable(ppZ),
    }, {
      metric: 'Highest Brawler Trophies',
      percentile: ztable(brawlerZ),
    }, {
      metric: 'Qualified for Championships',
      percentile: ccPercentile,
    }, {
      metric: '3vs3 Wins',
      percentile: ztable(victoryZ),
    }, {
      metric: 'Solo Showdown Wins',
      percentile: ztable(soloZ),
    }, {
      metric: 'Duo Showdown Wins',
      percentile: ztable(duoZ),
    }].sort((a1, a2) => a2.percentile - a1.percentile)

    const goodAchievements = allAchievements
      .filter(a => a.percentile >= 0.5)
    const achievements = goodAchievements.length == 0 ? allAchievements.slice(0, 1) : goodAchievements

    function formatPercentile(p: number) {
      let base = 10
      if (p >= 0.95) {
        base = 100
      }
      if (p >= 0.99) {
        base = 1000
      }
      if (p >= 0.999) {
        base = 10000
      }

      p = Math.floor(p * base) / base
      if (p == 0.5) {
        return 'Better than Average'
      }
      return `Better than ${p * base} out of ${base}`
    }

    return <table class="flex flex-wrap justify-center">
      { achievements.map(achievement =>
      <tr class="block mx-3 mt-3 bg-gray-300 rounded text-center px-4 py-3 w-full md:w-auto">
        <td class="block text-black text-xl font-bold">
          { achievement.metric }
        </td>
        <td class="mt-1 block text-primary-dark font-semibold">
          { formatPercentile(achievement.percentile) }
        </td>
      </tr>
      )}
    </table>
    }
  })
