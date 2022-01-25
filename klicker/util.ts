import { Measurement, MetaGridEntry, MetaGridEntryTiered } from "./types"

/*
 * min-max scale stat into the 5 tiers and put nulls into '?' tier
 */
export function scaleEntriesIntoTiers(entries: MetaGridEntry[], measurement: Measurement): MetaGridEntryTiered[] {
  const getStat = (e: MetaGridEntry) => e.measurementsRaw[measurement.id] as number
  const sortedEntries = entries
    .slice()
    .sort(compare1(measurement))

  const stats = sortedEntries
    .map(getStat)
    .reverse() as number[]
  if (stats.some(e => typeof e != 'number')) {
    return []
  }

  const sign = measurement.sign
  const min = stats[sign == -1 ? 1 : stats.length - 2]! // skip highest (outlier)
  const max = stats[sign == -1 ? stats.length - 2 : 1]! // skip lowest
  const clamp = (v: number) => Math.max(min, Math.min(max, v))
  const minMax = (v: number) => (clamp(v) - min) / (max - min)
  const tiers = ['S', 'A', 'B', 'C', 'D']

  return sortedEntries.map(entry => {
    let tier = '?'
    if (getStat(entry) != undefined) {
      const index = (tiers.length - 1) - Math.floor(minMax(getStat(entry)!) * (tiers.length - 1))
      tier = tiers[sign == -1 ? index : tiers.length - index - 1]
    }

    return {
      ...entry,
      tier,
    }
  })
}

export function compare(entry1: MetaGridEntry, entry2: MetaGridEntry, m: Measurement): number {
  const sign = m.sign
  const e1stat = entry1.measurementsRaw[m.id]
  const e2stat = entry2.measurementsRaw[m.id]
  if (typeof e1stat == 'number' && typeof e2stat == 'number') {
    return sign * (e1stat - e2stat)
  }
  if (typeof e1stat == 'string' && typeof e2stat == 'string') {
    return sign * e1stat.localeCompare(e2stat)
  }
  return 0
}

export function compare1(m: Measurement) {
  return (entry1: MetaGridEntry, entry2: MetaGridEntry) => compare(entry1, entry2, m)
}
