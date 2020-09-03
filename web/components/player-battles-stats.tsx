import Vue, { PropType } from 'vue'
import { PlayerWinrates, Battle } from '~/model/Api'
import { formatMode } from '~/lib/util'

export default Vue.extend({
  functional: true,
  props: {
    winrates: {
      type: Object as PropType<PlayerWinrates>,
      required: false
    },
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
  },
  render(h, { props }) {
    const winrates = props.winrates
    const battles = props.battles

    const totalBattles = winrates != undefined && winrates.total != undefined ?
      winrates.total.stats.picks : battles.length
    const winRate =
      winrates != undefined && winrates.total != undefined
        ? winrates.total.stats.winRate
      : (battles.length == 0 ? 0 :
        battles.filter((battle) => battle.victory).length / battles.length)
    const battlesByMode = battles.reduce((battlesByMode, battle) => ({
        ...battlesByMode,
        [battle.event.mode]: [...(battlesByMode[battle.event.mode] || []), battle],
      }), {})

    let avgTrophyChangeByMode = [] as any[] // TODO
    if (winrates != undefined && winrates.mode != undefined) {
      avgTrophyChangeByMode = Object.values(winrates.mode || {})
        .map((m) => ({ mode: m.name, trophyChange: m.stats.trophyChange }))
        .filter((m) => m.trophyChange != undefined)
    } else {
      const rankedBattles = (battles) => battles.filter(b => b.trophyChange != undefined)
      avgTrophyChangeByMode = [...Object.entries(battlesByMode)]
        .map(([mode, battles]) => [mode, rankedBattles(battles)])
        .filter(([mode, battles]) => battles.length > 0)
        .map(([mode, battles]) => ({
          mode,
          trophyChange: battles.reduce((trophies, b) => trophies + b.trophyChange, 0) / battles.length,
        }))
    }
    const modes = avgTrophyChangeByMode
      .sort((m1, m2) => m2.trophyChange - m1.trophyChange)
      .map((m) => m.mode)
    const bestMode = modes.length == 0 ? '?' : modes[0]

    return <dl class="mt-3 mb-6 bigstat-wrapper">
      <div class="bigstat-container">
        <dd class="bigstat-left bigstat-number bigstat-number--light">
          { Math.floor(winRate * totalBattles) }
        </dd>
        <dt class="bigstat-right bigstat-label text-xl">
          Wins Recorded
        </dt>
      </div>

      <div class="bigstat-container">
        <dd class="bigstat-left bigstat-number bigstat-number--light">
          { Math.floor((1 - winRate) * totalBattles) }
        </dd>
        <dt class="bigstat-right bigstat-label text-xl">
          Losses Recorded
        </dt>
      </div>

      <div class="bigstat-container">
        <dd class="bigstat-left bigstat-number bigstat-number--light leading-none">
          { formatMode(bestMode) }
        </dd>
        <dt class="bigstat-right bigstat-label text-xl">
          Best Mode
        </dt>
      </div>
    </dl>
  }
})
