import Vue, { PropType } from 'vue'
import { Player } from '~/model/Api'
import { MapMetaMap } from '~/model/MetaEntry'
import PlayerModeCard from '~/components/player-mode-card'

export default Vue.extend({
  functional: true,
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    battlesByMode: {
      type: Object as PropType<any>, // TODO
      required: true
    },
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      default: {}
    },
    showAllModes: {
      type: Boolean,
      required: true
    },
    tease: {
      type: Boolean,
      default: false
    },
  },
  render(h, { props }) {
    const tease = props.tease
    const player = props.player
    const battlesByMode = props.battlesByMode
    const activeMapMeta = props.activeMapMeta
    const showAllModes = props.showAllModes

    const playerModeStats = [] as any[] // TODO
    if (player.winrates != undefined && player.winrates.mode != undefined) {
      for (let mode in player.winrates.mode) {
        const stats = player.winrates.mode[mode].stats
        const wins = Math.floor(stats.winRate * stats.picks)
        const losses = Math.floor((1 - stats.winRate) * stats.picks)
        playerModeStats.push({
          mode,
          winRate: stats.winRate,
          picks: stats.picks,
          wins,
          losses,
        })
      }
    } else {
      for (let mode in battlesByMode) {
        const picks = battlesByMode[mode].length
        const wins = battlesByMode[mode].filter(b => b.victory).length
        const losses = picks - wins
        const winRate = wins / picks
        playerModeStats.push({
          mode,
          winRate,
          picks,
          wins,
          losses,
        })
      }
    }
    playerModeStats.sort((m1, m2) => m2.picks - m1.picks)

    return <div>
      <div class="overflow-x-auto -mx-4 overflow-y-hidden scrolling-touch flex md:flex-wrap">
        { playerModeStats.filter((stats, index) => !tease || index == 0).map((stats, index) =>
        <lazy
          key={stats.mode}
          render={showAllModes || index <= 3}
          class={{
            'md:hidden': !showAllModes && index > 3,
            'flex-0-auto mx-4 md:mx-auto w-64 md:w-1/2 h-48 md:h-auto card-wrapper': true,
          }}
          distance="600px"
        >
          <PlayerModeCard
            { ...{ attrs: {
            mode: stats.mode,
            stats: stats,
            'active-map-meta': activeMapMeta,
            'player-brawlers': Object.values(player.brawlers),
            } } }
          ></PlayerModeCard>
        </lazy>
        ) }
      </div>
    </div>
  }
})
