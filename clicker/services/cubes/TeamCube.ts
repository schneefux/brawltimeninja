import { ClickHouse } from "clickhouse";
import Cube, { Order } from "./Cube";
import MapMetaCube from "./MapMetaCube";
import SynergyMetaCube from "./SynergyCube";

export interface PicksWins {
  picks: number
  wins: number
}

export interface TeamPicksWins extends PicksWins {
  brawlers: string[]
}

function keyToTeam(id: string) {
  return id.split('+')
}

function teamToKey(...names: string[]) {
  return names.sort().join('+')
}

function addToMap(map: Map<string, PicksWins>, row: PicksWins, teamToKey: string) {
  if (!map.has(teamToKey)) {
    map.set(teamToKey, { picks: 0, wins: 0 })
  }
  map.get(teamToKey)!.picks += row.picks
  map.get(teamToKey)!.wins += row.wins
  return map
}

export class TeamCube extends SynergyMetaCube {
  // virtual
  table = ''

  constructor(
    private synergyCube: SynergyMetaCube,
    private mapMetaCube: MapMetaCube,
    ch: ClickHouse,
  ) {
    super(ch)
  }

  // noop
  public async up(ch2: ClickHouse) { }

  public async query(
      name: string,
      measures: string[]|['*'],
      dimensions: string[],
      slices: Partial<Record<string, string[]>> = {} as any,
      order: Partial<Record<string, Order>> = {},
      limit?: number): Promise<{ data: any[], totals: any, statistics: Record<string, number> }> {
    // TODO add more features (measures and dimensions)
    const allowedMeasures = ['picks', 'wins', 'battle_victory', 'timestamp']
    if (dimensions.length != 1 || dimensions[0] != 'brawler_names') {
      throw new Error('Cube must be sliced by brawler_names')
    }
    for (const measure of measures) {
      if (!allowedMeasures.includes(measure)) {
        throw new Error('Unsupported measure ' + measure)
      }
    }
    if (Object.keys(order).length > 1) {
      throw new Error('Only one sort key is supported')
    }
    for (const key in order) {
      if (!allowedMeasures.includes(key)) {
        throw new Error('Cannot sort by ' + key)
      }
    }

    // H(ally_brawler,brawler)
    const pairData = await this.synergyCube.query(name, ['picks', 'wins'], ['brawler_name', 'ally_brawler_name'], slices)

    // H(brawler) and H
    const data = await this.mapMetaCube.query(name, ['picks', 'wins'], ['brawler_name'], slices)

    const totalSampleSize = data.totals.picks
    const totalTimestamp = data.totals.timestamp

    // H(ally_brawler,brawler)
    const pairMap = new Map<string, Map<string, PicksWins>>()
    pairData.data.forEach((row) => {
      if (!pairMap.has(row.brawler_name as string)) {
        pairMap.set(row.brawler_name as string, new Map<string, PicksWins>())
      }
      pairMap.get(row.brawler_name as string)!.set(row.ally_brawler_name as string, {
        picks: row.picks as number,
        wins: row.wins as number,
      })
    })
    // H(brawler)
    const dataMap = new Map<string, PicksWins>()
    data.data.forEach((row) => dataMap.set(row.brawler_name as string, row as unknown as PicksWins))

    /*
      Let A, B, C be the three Brawlers and H(x) the number of wins or picks.
      We are interested in P(A,B,C).
      We know P(A,B,C) = P(A) * P(B|A) * P(C|A,B).
      Collecting data for H(A,B,C) is expensive (n brawlers -> n^3 permutations)
      but we have H(x) and H(x,y), so we know:
        P(A)   = H(A) / H
        P(B,A) = H(B,A) / H
        P(B|A) = P(B,A) / P(A)
               = H(B,A) / H(A)
      We we are missing P(C|A,B).
      We will cheat and calculate it as the weighted average of P(C|A) and P(C|B):
        P(C|A,B) = (P(C|A) * P(A) + P(C|B) * P(B)) / (P(A) + P(B))
                 = (H(C,A) / H(A) * H(A) / H + H(C,B) / H(B) * H(B) / H) / (H(A) / H + H(B) / H)
                 = (H(C,A) + H(C,B)) / (H(A) + H(B))
      This leaves us with
        P(A,B,C) = H(A) / H * H(B,A) / H(A) * (H(C,A) + H(C,B)) / (H(A) + H(B))
      Simplify:
        P(A,B,C) = H(B,A) * (H(C,A) + H(C,B)) / (H(A) + H(B)) / H
    */

    let teams: [string, PicksWins][] = []

    // duoShowdown is an exception because it has 2 player teams
    if (slices.battle_event_mode != undefined && slices.battle_event_mode[0] == 'duoShowdown') {
      const pairs = new Map<string, PicksWins>()
      pairMap.forEach((data, brawler1) => data.forEach((picksWins, brawler2) => {
        addToMap(pairs, picksWins, teamToKey(brawler1, brawler2))
      }))
      teams = [...pairs.entries()]
    } else {
      const tripleP = new Map<string, PicksWins>()

      for (const [c, hC] of dataMap) {
        for (const [b, hB] of dataMap) {
          for (const [a, hA] of dataMap) {
            const hBA = pairMap.get(a)?.get(b)
            const hCA = pairMap.get(c)?.get(a)
            const hCB = pairMap.get(c)?.get(b)
            // disqualify no data or Brawler duplicates
            if (hBA == undefined || hCA == undefined || hCB == undefined) {
              continue
            }
            // = H(B,A) * (H(C,A) + H(C,B)) / (H(A) + H(B)) / H
            // since we would multiply with H later, skip the division
            const data: PicksWins = {
              wins: hBA.wins * (hCA.wins + hCB.wins) / (hA.wins + hB.wins),
              picks: hBA.picks * (hCA.picks + hCB.picks) / (hA.picks + hB.picks),
            }
            addToMap(tripleP, data, teamToKey(a, b, c))
          }
        }
      }

      teams = [...tripleP.entries()]
    }

    let rows = teams.map(([id, s]) => ({
      ...s,
      brawler_names: keyToTeam(id),
      battle_victory: Math.max(0.0, Math.min(1.0, s.wins / s.picks)),
      timestamp: totalTimestamp,
    }))

    for (const key in order) {
      const o = key as 'picks'|'wins'|'battle_victory'
      rows.sort((r1, r2) => order[o] == 'desc' ? r2[o] - r1[o] : r1[o] - r2[o])
    }

    if (limit != undefined) {
      rows = rows.slice(0, limit)
    }

    return {
      data: rows,
      totals: {
        timestamp: totalTimestamp,
        picks: totalSampleSize,
      },
      statistics: {},
    }
  }
}
