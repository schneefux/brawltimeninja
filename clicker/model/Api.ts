import { BattleMeasures } from "./Clicker"

export interface PlayerWinrates {
  mode: {
    [id: string]: {
      name: string
      stats: BattleMeasures
    }
  }
  brawler: {
    [id: string]: {
      name: string
      stats: BattleMeasures
    }
  }
  total: {
    stats: BattleMeasures
  }
}
