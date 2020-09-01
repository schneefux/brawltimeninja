import Vue, { PropType } from 'vue'
import { Player, Battle } from '~/model/Api'
import { MapMetaMap } from '~/model/MetaEntry'
import PlayerModeCard from '~/components/player-mode-card'

export default Vue.extend({
  functional: true,
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      default: {}
    },
    tease: {
      type: Boolean,
      default: false
    },
  },
  render(h, { props }) {
    const tease = props.tease
    const player = props.player
    const battles = props.battles
    const activeMapMeta = props.activeMapMeta

    const battlesByMode = battles.reduce((battlesByMode, battle) => ({
        ...battlesByMode,
        [battle.event.mode]: [...(battlesByMode[battle.event.mode] || []), battle],
      }), {} as { [mode: string]: Battle[] })

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

    return <div class="flex flex-wrap justify-center">
      { playerModeStats.filter((stats, index) => !tease || index == 0).map((stats, index) =>
      <lazy
        key={stats.mode}
        render={index <= 3}
        class="md:mx-auto w-full md:w-1/2 h-auto card-wrapper"
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
  }
})
