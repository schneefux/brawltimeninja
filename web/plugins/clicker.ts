import { differenceInMinutes, parseISO } from "date-fns"
import { formatMode } from "~/lib/util"
import { CurrentAndUpcomingEvents } from "~/model/Api"

const cubes = ['player', 'brawler', 'map', 'synergy', 'starpower', 'gadget']

export interface PicksWins {
  picks: number
  wins: number
}

export interface TeamPicksWins extends PicksWins {
  brawlers: string[]
}

export interface EventMetadata {
  battle_event_id: number
  battle_event_map: string
  battle_event_mode: string
  battle_event_powerplay: boolean
  timestamp: string
  picks: number
  start?: string
  end?: string
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

interface Slices extends Record<string, string[]|undefined> {}

interface Clicker {
  defaultSlices(cube: string): Record<string, string[]>
  cubes: typeof cubes[number][]
  queryMetadata(cube: typeof cubes[number]): Promise<{ dimensions: string[], measures: string[], slices: Record<string, number> }>
  query<T=any>(
    name: string,
    cube: typeof cubes[number],
    dimensions: string[],
    measures: string[],
    slices: Slices,
    options: {
      sort?: Record<string, string>,
      limit?: number,
      cache?: number,
    }): Promise<{ data: T[], totals: T }>
  queryActiveEvents(): Promise<EventMetadata[]>,
  queryAllModes(): Promise<string[]>
  describeSlices(slices: Slices, timestamp?: string): string
  calculateBayesSynergies(slices: Slices, tag: string, brawler?: string, limit?: number): Promise<{
    sampleSize: number,
    timestamp: string,
    // H
    totals: PicksWins,
    // H(brawler)
    data: Map<string, PicksWins>,
    // H(ally_brawler,brawler)
    pairData: Map<string, Map<string, PicksWins>>,
  }>
  // use limit to approximate top N
  calculateTeams(slices: Slices, tag: string, limit?: number): Promise<{
    sampleSize: number,
    timestamp: string,
    teams: TeamPicksWins[],
  }>
}

declare module 'vue/types/vue' {
  interface Vue {
    $clicker: Clicker
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $clicker: Clicker
  }
  interface Context {
    $clicker: Clicker
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $clicker: Clicker
  }
}

export default (context, inject) => {
  inject('clicker', <Clicker>{
    defaultSlices(cube) {
      switch (cube) {
        case 'map':
          return {
            trophy_season_end: ['balance'],
            brawler_trophyrange: ['0', '10'],
            battle_event_powerplay: ['false'],
          }
        case 'battle':
          return {
            trophy_season_end: ['month'],
          }
        case 'brawler':
          return {
          }
        default:
          return {
            trophy_season_end: ['balance'],
            brawler_trophyrange: ['0', '10'],
          }
      }
    },
    cubes,
    queryMetadata(cube) {
      return context.$axios.$get(context.env.clickerUrl + '/clicker/cube/' + cube + '/metadata')
    },
    query(name, cube, dimensions, measures, slices, options = {}) {
      const query = new URLSearchParams({
        include: measures.join(','),
      })
      if (name != undefined) {
        query.append('name', name)
      }
      if (options.sort != undefined) {
        query.append('sort', Object.entries(options.sort || {}).map(([name, order]) => (order == 'desc' ? '-' : '') + name).join(','))
      }
      if (options.limit != undefined) {
        query.append('limit', options.limit.toString())
      }
      if (options.cache != undefined) {
        query.append('cache', options.cache.toString())
      }
      Object.entries(slices)
        .filter(([name, args]) => args != undefined)
        .forEach(([name, args]) => query.append('slice[' + name + ']', args!.join(',')))
      const url = context.env.clickerUrl + '/clicker/cube/' + cube + '/query/' + dimensions.join(',') + '?' + query.toString()
      console.log(`querying clicker: cube=${cube}, dimensions=${JSON.stringify(dimensions)}, measures=${JSON.stringify(measures)}, slices=${JSON.stringify(slices)} name=${name} (${url})`)
      return context.$axios.$get(url)
    },
    async queryActiveEvents() {
      const events = await this.query<EventMetadata>('active.events', 'map',
        ['battle_event_mode', 'battle_event_map', 'battle_event_id', 'battle_event_powerplay'],
        ['battle_event_mode', 'battle_event_map', 'battle_event_id', 'battle_event_powerplay', 'timestamp', 'picks'],
        { trophy_season_end: ['current'] },
        {
          sort: { timestamp: 'desc' },
          cache: 60*5,
          limit: 10,
        })

      const lastEvents = events.data
        .filter(e => differenceInMinutes(new Date(), parseISO(e.timestamp)) <= 30)
        .sort((e1, e2) => e2.picks - e1.picks)

      const starlistData = await context.$axios.$get('/api/events/active')
        .catch(() => ({ current: [], upcoming: [] })) as CurrentAndUpcomingEvents
      starlistData.current.forEach(s => {
        const match = lastEvents.find(e => e.battle_event_id.toString() == s.id)
        if (match) {
          match.start = s.start
          match.end = s.end
        }
      })

      return lastEvents
    },
    async queryAllModes() {
      const modes = await this.query<{ battle_event_mode: string }>('all.modes', 'map',
        ['battle_event_mode'],
        ['battle_event_mode'],
        { trophy_season_end: ['balance'] },
        { sort: { picks: 'desc' }, cache: 60*60 })
      return modes.data.map(row => row.battle_event_mode)
    },
    describeSlices(slices: Record<string, string[]>, timestamp?: string) {
      let description: string[] = []

      const powerplay = 'battle_event_powerplay' in slices && slices.battle_event_powerplay[0] == 'true'

      if ('battle_event_mode' in slices) {
        let mapName = formatMode(slices.battle_event_mode[0])
        if ('battle_event_map' in slices) {
          mapName += ' - ' + slices.battle_event_map[0]
        }
        if (powerplay) {
          mapName += ' (Power Play)'
        }
        description.push(mapName)
      } else {
        if (powerplay) {
          description.push('Power Play')
        }
      }

      if ('brawler_trophyrange' in slices) {
        let trophyName = ''
        if (slices.brawler_trophyrange[0] == '0' && slices.brawler_trophyrange[1] == '10') {
          trophyName = 'all '
        } else {
          const lower = slices.brawler_trophyrange[0] + '00'
          const upper = slices.brawler_trophyrange[1] == '10' ? '+' : ('-' + slices.brawler_trophyrange[1] + '00')
          trophyName = lower + upper + ' '
        }
        trophyName += powerplay ? 'Points' : 'Trophies'
        description.push(trophyName)
      }

      const seasonDescription = {
        balance: 'update',
        month: 'month',
        season: 'season',
      }
      if ('trophy_season_end' in slices && slices.trophy_season_end[0] in seasonDescription) {
        description.push('current ' + seasonDescription[slices.trophy_season_end[0]])
      }

      if (timestamp != undefined) {
        description.push('created ' + parseISO(timestamp).toLocaleDateString())
      }

      return description.join(', ')
    },
    async calculateBayesSynergies(slices: Record<string, string[]>, tag: string, brawler?: string, limit?: number) {
      // H(ally_brawler,brawler)
      const pairData = await this.query(tag, 'synergy',
        ['brawler_name', 'ally_brawler_name'],
        ['wins', 'picks'],
        {
          ...slices,
          ...(brawler == undefined ? {} : { brawler_name: [brawler.toUpperCase()] }),
        },
        {
          cache: 60*60,
          sort: { wins: 'desc' },
          limit,
        })
      // H(brawler) and H
      const data = await this.query(tag, 'map',
        ['brawler_name'],
        ['wins', 'picks', 'timestamp'],
        slices,
        { cache: 60*60 })

      const totalSampleSize = data.totals.picks
      const totalTimestamp = data.totals.timestamp

      // H(ally_brawler,brawler)
      const pairMap = new Map<string, Map<string, PicksWins>>()
      pairData.data.forEach((row) => {
        if (!pairMap.has(row.brawler_name)) {
          pairMap.set(row.brawler_name, new Map<string, PicksWins>())
        }
        pairMap.get(row.brawler_name)!.set(row.ally_brawler_name, {
          picks: row.picks,
          wins: row.wins,
        })
      })
      // H(brawler)
      const dataMap = new Map<string, PicksWins>()
      data.data.forEach((row) => dataMap.set(row.brawler_name, row))
      // H
      const totals: PicksWins = {
        picks: data.totals.picks,
        wins: data.totals.wins,
      }

      return {
        totals,
        data: dataMap,
        pairData: pairMap,
        sampleSize: totalSampleSize,
        timestamp: totalTimestamp,
      }
    },
    async calculateTeams(slices: Record<string, string[]>, tag: string, limit?: number) {
      const bayesStats = await this.calculateBayesSynergies(slices, tag, undefined, limit)

      /*
        Let A, B, C be the three Brawlers and H(x) the number of wins or picks.
        We are interested in P(A,B,C).
        We know P(A,B,C) = P(A) * P(B|A) * P(C|A,B).
        Collecting data for H(A,B,C) is expensive (n brawlers -> n^3 permutations)
        but we have H(x) and H(x,y), so we know:
          P(A) = H(A) / H
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
      if ('battle_event_mode' in slices && slices.battle_event_mode[0] == 'duoShowdown') {
        const pairs = new Map<string, PicksWins>()
        bayesStats.pairData.forEach((data, brawler1) => data.forEach((picksWins, brawler2) => {
          addToMap(pairs, picksWins, teamToKey(brawler1, brawler2))
        }))
        teams = [...pairs.entries()]
      } else {
        const tripleP = new Map<string, PicksWins>()

        for (const [c, hC] of bayesStats.data) {
          for (const [b, hB] of bayesStats.data) {
            for (const [a, hA] of bayesStats.data) {
              const hBA = bayesStats.pairData.get(a)?.get(b)
              const hCA = bayesStats.pairData.get(c)?.get(a)
              const hCB = bayesStats.pairData.get(c)?.get(b)
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

      const teamsPicksWins: TeamPicksWins[] = teams.map(([id, s]) => ({
        ...s,
        brawlers: keyToTeam(id),
      }))

      return {
        sampleSize: bayesStats.sampleSize,
        timestamp: bayesStats.timestamp,
        teams: teamsPicksWins,
      }
    }
  })
}
