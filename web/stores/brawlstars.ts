import { defineStore } from 'pinia'
import { totalBrawlers } from '~/lib/util'
import { Player } from '~/model/Api'

interface StoredPlayer {
  tag: string
  name: string
}

interface State {
  featuredPlayers: StoredPlayer[]
  totalBrawlers: number
  player: Player|undefined
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
    totalBrawlers: totalBrawlers,
    player: undefined,
  }),
  actions: {
    async loadPlayer(tag: string) {
      this.player = await this.api.player.byTag.query(tag)
    },
  },
})

