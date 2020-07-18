import Vue, { PropType } from 'vue'
import { scaleMinMax, zip } from '~/lib/util'
import BrawlerCard from '~/components/brawler-card'
import LeaderboardIcon from '~/assets/images/icon/leaderboards_optimized.png'
import TrophyIcon from '~/assets/images/icon/trophy_optimized.png'
import PowerPointIcon from '~/assets/images/icon/powerpoint_optimized.png'
import StarpowerIcon from '~/assets/images/icon/starpower_optimized.png'
import { Brawler } from '~/model/Api'

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
  },
  render(h, { props }) {
    const brawler = props.brawler
    let daysSinceBrawlerHistoryStart = undefined as undefined|number
    let brawlerHistoryPoints = [] as number[][]
    let history = undefined
    if (brawler.history.length > 1) {
      const start = Date.parse(brawler.history[0].timestamp as string)
      const now = (new Date()).getTime()
      daysSinceBrawlerHistoryStart = Math.ceil((now - start) / 1000 / 3600 / 24)

      const dates = brawler.history.map(({ timestamp }) => Date.parse(timestamp as string))
      const datesS = scaleMinMax(dates)
      const trophies = brawler.history.map(({ trophies }) => trophies)
      const trophiesS = scaleMinMax(trophies)
      brawlerHistoryPoints = zip(datesS, trophiesS)

      history = <div class="w-32 relative mx-auto my-2">
        <span class="absolute text-sm text-grey-light text-shadow-primary-dark font-semibold left-0 top-0 -mt-2 -ml-1">
          { brawler.trophies >= brawler.history[0].trophies ? '+' : '' }{ brawler.trophies - brawler.history[0].trophies }
        </span>
        <span class="absolute text-xs text-grey-light text-shadow-primary-dark -mb-2 right-0 bottom-0">
          since { daysSinceBrawlerHistoryStart }d ago
        </span>
        <svg
          viewBox="0 0 128 32"
          preserveAspectRatio="none"
          class="w-full h-8 overflow-visible"
        >
          <polyline
            points={brawlerHistoryPoints.map(([x, y]) => `${x*128},${(1-y)*32} `)}
            fill="none"
            stroke="#f2d024"
            stroke-width="4"
          /> {/* stroke: secondary-dark */}
        </svg>
      </div>
    }

    const stats = <table slot="stats">
      { brawler.history.length <= 1 ?
        <tr class="card-props">
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
        : ''
      }
      <tr class="card-props">
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
      <tr class="card-props">
        <td class="text-center">
          <img
            src={TrophyIcon}
            class="card-prop-icon"
          />
        </td>
        <td class="card-prop-value text-right pr-1">
          { brawler.highestTrophies }
        </td>
        <td class="card-prop-label">
          Max Trophies
        </td>
      </tr>
      <tr class="card-props">
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
    </table>

    const slots = {
      history: () => history,
      stats: () => stats,
    }

    const brawlerCard = BrawlerCard as any
    return <brawlerCard
        title={brawler.name}
        brawler={brawler.id}
        scopedSlots={slots}
      />
  }
})
