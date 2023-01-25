import { defineStore } from 'pinia'
import { tagToId } from '~/lib/util'
import { Player } from '~/model/Api'

interface StoredPlayer {
  tag: string
  name: string
}

interface State {
  featuredPlayers: StoredPlayer[]
  totalBrawlers: number
  player: Player|undefined
  playerTotals: PlayerTotals|undefined
}

export interface PlayerTotals {
  picks: number
  winRate: number
  trophyChange: number
}

export const useBrawlstarsStore = defineStore('brawlstars', {
  state: (): State => ({
    featuredPlayers: [ {
        tag: 'V8LLPPC',
        name: 'xXcuzMePlisThXx',
      }, {
        tag: 'VLQPVPY',
        name: 'Hyra',
      }, {
        tag: '2YC9RVYQC',
        name: 'NaVi | Cubick',
      }, {
        tag: '8LQ9JR82',
        name: 'BGT | Eqwaak',
      }, {
        tag: 'QRUQQLV0',
        name: 'CG |Nukleo',
      } ],
    totalBrawlers: 56,
    player: undefined,
    playerTotals: undefined,
  }),
  actions: {
    async loadPlayer(tag: string) {
      const player = await this.api.player.byTag.query(tag)
      this.setPlayer(player)

      const battleData = await this.klicker.query({
        cubeId: 'battle',
        dimensionsIds: [],
        metricsIds: ['picks', 'winRate', 'trophyChange'],
        slices: {
          playerId: [tagToId(tag)],
        },
        sortId: 'picks',
      }).catch(() => ({
        data: [{
          metricsRaw: {
            picks: 0,
          },
        }],
      }))

      if (battleData.data[0].metricsRaw.picks > 0) {
        const totals = battleData.data[0].metricsRaw as PlayerTotals
        this.setPlayerTotals(totals)
      } else {
        // calculate player totals from battle log
        const picks = player.battles.length
        const trophyChanges = player.battles
          .map((battle) => battle.trophyChange)
          .filter((trophyChange): trophyChange is number => trophyChange != undefined)
        const trophyChange = trophyChanges.length == 0 ? 0 : trophyChanges.reduce((sum, t) => sum + t, 0) / trophyChanges.length
        const winRate = player.battles.length == 0 ? 0 : player.battles.filter((battle) => battle.victory).length / player.battles.length

        const totals = {
          picks,
          trophyChange,
          winRate,
        }
        this.setPlayerTotals(totals)
      }
    },
    setPlayer(player: Player) {
      this.player = player
    },
    setPlayerTotals(totals: PlayerTotals) {
      this.playerTotals = totals
    },
  },
})

