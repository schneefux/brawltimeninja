import Vue, { PropType } from 'vue'
import BrawlerCard from '~/components/brawler-card'
import HistoryGraph from '~/components/history-graph'
import LeaderboardIcon from '~/assets/images/icon/leaderboards_optimized.png'
import TrophyIcon from '~/assets/images/icon/trophy_optimized.png'
import PowerPointIcon from '~/assets/images/icon/powerpoint_optimized.png'
import StarpowerIcon from '~/assets/images/icon/starpower_optimized.png'
import { Brawler, PlayerBrawlerWinrates } from '~/model/Api'

interface BrawlerWithId extends Brawler {
  id: string
}

export default Vue.extend({
  functional: true,
  props: {
    brawler: {
      type: Object as PropType<BrawlerWithId>,
      required: true,
    },
    brawlerWinrates: {
      type: Object as PropType<PlayerBrawlerWinrates>,
      default: () => ({} as PlayerBrawlerWinrates),
    },
  },
  render(h, { props }) {
    const brawler = props.brawler
    let history = undefined
    if (brawler.history.length > 1) {
      history = <lazy class="w-full h-32 mt-2">
        <HistoryGraph { ...{ attrs: {
          history: brawler.history,
        } } } />
      </lazy>
    }
    const brawlerWinrate = Object.values(props.brawlerWinrates)
      .find((brawler) => brawler.name == props.brawler.name)

    const stats = <table slot="stats">
      <tbody>
        <tr class="card__props">
          <td class="text-center">
            <img
              src={LeaderboardIcon}
              class="card-prop-icon"
            />
          </td>
          <td class="card-prop-value text-right pr-1">
            { brawler.rank }
          </td>
          <td class="card-prop-label">
            Rank
          </td>
        </tr>
        <tr class="card__props">
          <td class="text-center">
            <img
              src={TrophyIcon}
              class="card-prop-icon"
            />
          </td>
          <td class="card-prop-value text-right pr-1">
            { brawler.trophies }
          </td>
          <td class="card-prop-label">
            Trophies
          </td>
        </tr>
        <tr class="card__props">
          <td class="text-center">
            <img
              src={ brawler.power < 10 ? PowerPointIcon : StarpowerIcon }
              class="card-prop-icon"
            />
          </td>
          <td class="card-prop-value text-right pr-1">
            { brawler.power }
          </td>
          <td class="card-prop-label">
            Power Level
          </td>
        </tr>
      </tbody>
    </table>

    const expand = <div class="mx-2">
      <div class="w-full mt-3">
        { history }
      </div>
      <div class="w-full my-2">
        <table class="mt-4 px-4 w-full font-semibold">
          <tbody>
            <tr class="flex text-2xl">
              <td class="w-1/2 pr-1 text-right text-primary-light">Win Rate</td>
              <td class="w-1/2 pl-1 text-left text-secondary">{ brawlerWinrate == undefined ? '?' : Math.round(brawlerWinrate.stats.winRate * 100) + '%' }</td>
            </tr>
            <tr class="flex text-lg">
              <td class="w-1/2 pr-1 text-right text-primary-light">Highest Trophies</td>
              <td class="w-1/2 pl-1 text-left text-secondary">{ brawler.highestTrophies }</td>
            </tr>
          </tbody>
        </table>
        { brawlerWinrate != undefined ?
          <p class="font-semibold">
            <span class="text-green-500">
              { Math.floor(brawlerWinrate.stats.winRate * brawlerWinrate.stats.picks) }W
            </span>
            <span class="px-1">-</span>
            <span class="text-red-500">
              { Math.floor((1-brawlerWinrate.stats.winRate) * brawlerWinrate.stats.picks) }L
            </span>
          </p>
          : ''
        }
      </div>
    </div>

    const slots = {
      stats: () => stats,
      expand: () => expand,
    }

    const brawlerCard = BrawlerCard as any
    return <brawlerCard
      scopedSlots={slots}
      title={brawler.name || ''}
      brawler={brawler.id}
    />
  }
})
