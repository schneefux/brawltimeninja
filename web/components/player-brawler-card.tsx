import Vue, { PropType } from 'vue'
import BrawlerCard from '~/components/brawler-card'
import HistoryGraph from '~/components/history-graph'
import LeaderboardIcon from '~/assets/images/icon/leaderboards_optimized.png'
import TrophyIcon from '~/assets/images/icon/trophy_optimized.png'
import PowerPointIcon from '~/assets/images/icon/powerpoint_optimized.png'
import StarpowerIcon from '~/assets/images/icon/starpower_optimized.png'
import { Brawler } from '~/model/Api'
import { TrophiesRow } from '~/model/Clicker'
import { capitalizeWords } from '~/lib/util'

interface BrawlerWithId extends Brawler {
  id: string
}

export default Vue.extend({
  props: {
    playerTag: {
      type: String,
      required: true
    },
    brawler: {
      type: Object as PropType<BrawlerWithId>,
      required: true,
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    enableClickerStats: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      open: this.defaultOpen,
      winrate: 0,
      picks: 0,
      history: [] as TrophiesRow[],
    }
  },
  async fetch() {
    if (!this.open || !this.enableClickerStats) {
      return
    }

    const battleData = await this.$clicker.query('player.winrates.brawler',
      'battle',
      [],
      ['picks', 'battle_victory'],
      {
        ...this.$clicker.defaultSlices('battle'),
        // TODO use ID
        brawler_name: [this.brawler.name.toUpperCase()],
        player_tag: [this.playerTag],
      },
      { cache: 60 })
    this.winrate = battleData.data[0].battle_victory
    this.picks = battleData.data[0].picks

    const brawlerData = await this.$clicker.query('player.brawler_history',
      'brawler',
      ['timestamp'],
      ['timestamp', 'brawler_trophies'],
      {
        ...this.$clicker.defaultSlices('brawler'),
        // TODO use ID
        brawler_name: [this.brawler.name.toUpperCase()],
        player_tag: [this.playerTag],
      },
      { cache: 60*60 })
    this.history = brawlerData.data.map(b => ({
      timestamp: b.timestamp,
      trophies: b.brawler_trophies,
    } as TrophiesRow))
  },
  watch: {
    open: '$fetch',
    enableClickerStats: '$fetch',
  },
  fetchDelay: 0,
  render(h) {
    const brawler = this.brawler
    const open = this.open

    let history: any
    if (this.history.length > 1) {
      history = <lazy class="w-full h-32 mt-2">
        <HistoryGraph { ...{ attrs: {
          history: this.history,
        } } } />
      </lazy>
    }
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

    const expand =
    <div class="w-full relative z-10 text-center text-sm bg-primary-darker">
      <button
        onClick={() => this.open = !open}
        class="w-full py-1 px-2 bg-primary-dark hover:bg-primary text-gray-400 font-semibold border-t-2 border-primary-darkest"
      >
        { open ? 'Hide' : 'Show' } Details
      </button>
      { open ?
      <div class="mx-2 py-1">
        <div class="w-full mt-3">
          { history }
        </div>
        <div class="w-full my-2">
          <table class="mt-4 px-4 w-full font-semibold">
            <tbody>
              <tr class="flex text-2xl">
                <td class="w-1/2 pr-1 text-right text-primary-light">Win Rate</td>
                <td class="w-1/2 pl-1 text-left text-secondary">{ this.picks == 0 ? '?' : Math.round(this.winrate * 100) + '%' }</td>
              </tr>
              <tr class="flex text-lg">
                <td class="w-1/2 pr-1 text-right text-primary-light">Highest Trophies</td>
                <td class="w-1/2 pl-1 text-left text-secondary">{ brawler.highestTrophies }</td>
              </tr>
            </tbody>
          </table>
          { this.picks > 0 ?
            <p class="font-semibold">
              <span class="text-green-500">
                { Math.floor(this.winrate * this.picks) }W
              </span>
              <span class="px-1">-</span>
              <span class="text-red-500">
                { Math.floor((1-this.winrate) * this.picks) }L
              </span>
            </p>
            : ''
          }
        </div>
      </div>
      : '' }
    </div>

    const slots = {
      stats: () => stats,
      expand: () => expand,
    }

    const brawlerCard = BrawlerCard as any
    return <brawlerCard
      scopedSlots={slots}
      title={capitalizeWords(brawler.name.toLowerCase()) || ''}
      brawler={brawler.name}
    />
  }
})
