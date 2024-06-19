import { ComparingMetaGridEntry, CubeComparingQuery, IKlickerService, MetaGridEntry, SliceValue } from "@schneefux/klicker/types"
import { calculateGini, calculateMoe, formatClickhouseDate, formatMode, getTodaySeasonEnd, rateGini, rateMoe, unformatMode } from "~/lib/util"
import { Prompt } from "./PromptTemplateRenderService"
import { scaleEntriesIntoTiers } from "@schneefux/klicker/util"
import { winRateAdjMergedMetric } from "~/lib/klicker.cubes"
import { formatDistanceToNow, subWeeks, differenceInDays } from 'date-fns'
import { FandomModeData } from "./FandomService"
import { Locale, loadLocaleWithFallback, locales } from "~/locales"
import { config } from "~/config"

const comparingAccessoryQuery = (accessory: 'gears'|'gadgets'|'starpowers', slices: SliceValue) => {
  return {
    cubeId: 'battle',
    dimensionsIds: accessory == 'gears' ? ['gear'] : ['brawler', accessory == 'gadgets' ? 'gadget' : 'starpower'],
    metricsIds: ['winRate'],
    slices: {
      ...slices,
      [(accessory == 'gears' ? 'gear' : accessory == 'gadgets' ? 'gadget' : 'starpower') + 'IdNeq']: ['0'],
    },
    sortId: 'pvalue',
    comparing: true,
    reference: {
      cubeId: 'battle',
      dimensionsIds: accessory == 'gears' ? [] : ['brawler'],
      metricsIds: ['winRate'],
      slices: {
        ...slices,
        [accessory + 'Length']: ['0'], // no accessory identified
      },
      sortId: 'pvalue',
    },
  } satisfies CubeComparingQuery
}

const filterSignificantImprovements = (r: ComparingMetaGridEntry) =>
  r.test.difference.differenceRaw > 0 && r.test.difference.pValueRaw < 0.10

export default class MapReport {
  constructor(private $klicker: IKlickerService) {}

  private async getTranslatedMapAndModeName(locale: Locale, mode: string, map: string) {
    const localeStrings = await loadLocaleWithFallback(locale, locales[0], config)

    const event = await this.$klicker.query({
      cubeId: 'map',
      slices: {
        mode: [mode],
        map: [map],
      },
      dimensionsIds: [],
      metricsIds: ['eventId'],
      sortId: 'eventId',
      limit: 1,
    })

    const modeName = localeStrings[`mode.${mode}`] ?? unformatMode(mode)
    const mapName = localeStrings[`map.${event.data[0].metricsRaw.eventId}`] ?? map
    return { modeName, mapName }
  }

  async generateTemplateForMap(locale: Locale, mode: string, map: string, fandomModeData: FandomModeData|undefined): Promise<{ system: string, user: Prompt[] }|undefined> {
    const { modeName, mapName } = await this.getTranslatedMapAndModeName(locale, mode, map)

    const season = getTodaySeasonEnd()

    const slices: SliceValue = {
      season: [formatClickhouseDate(season)],
      mode: [mode],
      map: [map],
    }

    const totals = await this.$klicker.query({
      cubeId: 'battle',
      dimensionsIds: [],
      metricsIds: ['picks', 'timestamp'],
      slices,
      sortId: 'picks',
    })

    const daysSinceLastUpdate = differenceInDays(new Date(), totals.data[0].metricsRaw.timestamp)
    if (daysSinceLastUpdate > 7) {
      console.warn('not rendering template for', mode, map, 'because the data is out of date')
      return undefined
    }

    const sampleSize = totals.data[0].metricsRaw.picks as number
    if (sampleSize < 1000) {
      console.warn('not rendering template for', mode, map, 'because the sample size is too small')
      return undefined
    }

    const bestBrawlersResponse = await this.$klicker.query({
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        metricsIds: ['winRateAdj', 'useRate'],
        slices,
        sortId: 'winRateAdj',
      })

    const tierListEntries = scaleEntriesIntoTiers(bestBrawlersResponse.data, winRateAdjMergedMetric)
    const tierListMap = { S: [], A: [], B: [], C: [], D: [] } as Record<string, MetaGridEntry[]>
    tierListEntries.forEach(e => e.tier in tierListMap ? tierListMap[e.tier].push(e) : tierListMap[e.tier] = [e])

    const prompts: Prompt[] = [{
      text: `# ${mapName} - ${modeName}`,
    }, {
      text:
`Brawl Stars is a video game by Supercell.
In Brawl Stars, players choose Brawlers, each with distinctive abilities, to play in a mode on a map.
Brawler choice is important because abilities are more useful in some game modes or maps than in others.
Brawl Time Ninja tracks Brawler statistics and analyzes Battle Logs to create reports and dashboards so that you can improve your gameplay.
In this report, you can learn about the best Brawlers, the best Builds and the best Teams for Open Space in Gem Grab.`
    }, {
      text: `## How to play ${modeName}`,
    }, ...(fandomModeData != undefined ? [{
      text: fandomModeData.shortDescription.split('\n').join(' ')
    }] : []) satisfies Prompt[], {
      text: `## Finding the Best Brawlers to play`,
    }, {
      text:
`You can access the Brawl Time Ninja dashboard to get up-to-date information and customize the dashboard with filters.
The data source for this analysis is all Battles played by users of Brawl Time Ninja on Open Space in the mode Gem Grab.
For finding the best Brawler to play, you should consider the win rate and use rate.
Brawl Time Ninja calculates win rates like this: games won are divided by games played with this Brawler, with ties counting as 0.5 wins.
Brawlers with a high win rate are likely to be the best Brawlers because they win the most games.
However, Brawlers which are rarely used can have a high win rate because they are only played by experienced players.
This is why the use rate should be considered.
Brawl Time Ninja calculates the use rate as the fraction of players who chose this Brawler, weighted by how many Brawlers each player has unlocked.
A high win rate and a high use rate are the best indicators for a good Brawler, while a high win rate and a low use rate can indicate that a Brawler has high potential.
When choosing a Brawler, you should take your own play style and the Brawlers you are most comfortable with into account.`,
    }, {
      text: async () => {
        const dataSince = subWeeks(season, 2) // seasons last 2 weeks, get start of season
        const lastUpdate = formatDistanceToNow(totals.data[0].metricsRaw.timestamp, { addSuffix: true })
        const isUpToDate = daysSinceLastUpdate < 3
        const isLargeSample = sampleSize >= 50000
        const isReliable = isUpToDate && isLargeSample
        const moeRaw = calculateMoe(sampleSize, totals.data[0].metricsRaw.picks as number)
        const moe = (moeRaw * 100).toFixed(2) + '%'
        const moeRating = rateMoe(moeRaw)
        const giniRaw = calculateGini(bestBrawlersResponse.data.map(b => b.metricsRaw.useRate as number))
        const gini = giniRaw.toFixed(2)
        const giniRating = rateGini(giniRaw)
        return '' +
`For a reliable data analysis, the data should be up to date and the win rates should be accurate because they are based on a large sample of battles.
For this analysis, written ${new Date().toLocaleDateString('en')}, battles played since ${dataSince.toLocaleDateString('en')} are taken into account.
The data can be considered up to date when the last battle was collected less than 3 days ago. At the time of writing this analysis, the last battle was collected ${lastUpdate}.
The sample size should be large, which means there should be at least 50000 battles. This analysis is based on a sample of ${sampleSize} battles.
The margin of error for win rates is calculated from the sample size. It should be low, so that win rates have high accuracy. The margin of error is ${moe}, so win rates are calculated with ${moeRating} accuracy.
The data is ${isUpToDate ? '' : 'not'} up to date and the sample size is ${isLargeSample ? '' : 'not'} large so the data ${isReliable ? 'can be considered reliable' : 'should be interpreted with caution'}.
Brawl Time Ninja continuously collects data, you can use the dashboard to get the latest information or come back at a later date to read an updated analysis.

When choosing their Brawler and build, you should consider which Brawlers you are most likely to play with and against.
You can expect to meet many different Brawlers when the meta is diverse.
The Gini coefficient is a measure of diversity, calculated from the use rate. When it is 0, all Brawlers are used equally, when it is 1, only one Brawler is used.
For this data, the Gini coefficient is ${gini}, which is a ${giniRating} distribution of use rates.
Therefore, you can expect to ${giniRating == 'balanced' ? 'meet many different Brawlers' : 'meet some Brawlers more often than others'}.`
      },
    }, {
      text: `## Best Brawlers on ${mapName}`,
    }, {
      text: async () => {
        const bestBrawlers = bestBrawlersResponse
          .data
          .slice(0, 5)
          .map(r => ({
            brawler: r.dimensions.brawler,
            winRate: r.metrics.winRateAdj,
            useRate: r.metrics.useRate
          }))

        const bestBrawlersLines = bestBrawlers
          .map((d, index) => `${index+1}. ${d.brawler}: ${d.winRate} win rate, ${d.useRate} use rate.`)
          .join('\n')

        const relevantTips = bestBrawlers
          .map(d => fandomModeData?.brawlerTips[d.brawler] != undefined ? `- ${d.brawler}: ${fandomModeData?.brawlerTips[d.brawler]}` : undefined)
          .filter(t => t != undefined)
          .join('\n')

        return '' +
`The best Brawlers to play on ${mapName} based on their high win rate are:

${bestBrawlersLines}
` + (relevantTips.length > 0 ?
`
Tips for playing them in ${modeName}:

${relevantTips}` : '')
      },
    }, {
      text: async () => {
        const outlierBrawlersResponse = await this.$klicker.comparingQuery({
          comparing: true,
          cubeId: 'map',
          sortId: 'pvalue',
          dimensionsIds: ['brawler'],
          metricsIds: ['winRate'],
          slices,
          reference: {
            cubeId: 'map',
            dimensionsIds: ['brawler'],
            metricsIds: ['winRate'],
            slices: {
              ...slices,
              map: [],
            },
            sortId: 'pvalue',
          },
        })

        const outlierBrawlers = outlierBrawlersResponse
          .data
          .filter(filterSignificantImprovements)
          .slice(0, 3)
          .map(r => ({
            brawler: r.dimensions.brawler,
            winRate: r.metrics.winRate,
            difference: r.test.difference.difference,
          }))

        if (outlierBrawlers.length == 0) {
          return ''
        }

        const outlierBrawlersLines =
          outlierBrawlers.map(d => `- ${d.brawler}: ${d.winRate} map win rate, ${d.difference} than in ${modeName}.`)
          .join('\n')

        const relevantTips = outlierBrawlers
          .map(d => fandomModeData?.brawlerTips[d.brawler] != undefined ? `- ${d.brawler}: ${fandomModeData?.brawlerTips[d.brawler]}` : undefined)
          .filter(t => t != undefined)
          .join('\n')

      return '' +
`You should consider Brawlers that have a higher win rate on ${mapName} than they usually have in ${modeName}, because playing a Brawler that is not usually good in this mode can be fun.
Outstanding Brawlers on ${mapName} are:

${outlierBrawlersLines}
` + (relevantTips.length > 0 ?
`
Tips for playing them in ${modeName}:

${relevantTips}` : '')
      }
    }, {
      text: `## Tier List for ${mapName}`,
    }, {
      text: async () => {
        const tierListLines = Object.entries(tierListMap)
          .map(([tier, entries]) => '- ' + tier + ': ' + entries.map(e => e.dimensions.brawler).join(', '))
          .join('\n')

        return '' +
`A Tier List ranks Brawlers in the tiers S, A, B, C, D by their win rate from best to worst.
The Tier List for ${mapName} in ${modeName}:

${tierListLines}`
      }
    }, {
      text: `## Best Builds on ${mapName}`,
    }, {
      text: async () => {
        const bestStarPower = await this.$klicker.comparingQuery(comparingAccessoryQuery('starpowers', slices))
        const bestStarPowerLines = bestStarPower
          .data
          .filter(filterSignificantImprovements)
          .slice(0, 5)
          .map(r => ({
            brawler: r.dimensions.brawler,
            starpower: r.dimensions.starpower,
            winRate: r.metrics.winRate,
            difference: r.test.difference.difference
          }))
          .map(d => `- ${d.brawler} with the Star Power "${d.starpower}": ${d.winRate} win rate, ${d.difference} than without`)
          .join('\n')

        const bestGadget = await this.$klicker.comparingQuery(comparingAccessoryQuery('gadgets', slices))
        const bestGadgetLines = bestGadget
          .data
          .filter(filterSignificantImprovements)
          .slice(0, 5)
          .map(r => ({
            brawler: r.dimensions.brawler,
            gadget: r.dimensions.gadget,
            winRate: r.metrics.winRate,
            difference: r.test.difference.difference
          }))
          .map(d => `- ${d.brawler} with the Gadget "${d.gadget}": ${d.winRate} win rate, ${d.difference} than without`)
          .join('\n')

        const bestGear = await this.$klicker.comparingQuery(comparingAccessoryQuery('gears', slices))
        const bestGearLines = bestGear
          .data
          .filter(filterSignificantImprovements)
          .slice(0, 5)
          .map(r => ({
            gear: r.dimensions.gear,
            winRate: r.metrics.winRate,
            difference: r.test.difference.difference
          }))
          .map(d => `- Gear "${d.gear}": ${d.winRate} win rate, ${d.difference} than without`)
          .join('\n')

        return '' +
`A Brawler build consists of a Star Power, a Gadget and a Gear.
A good build should improve the Brawler's win rate.
Brawl Time Ninja calculates Star Power, Gadget and Gear win rates by comparing win rates of Brawlers who own just a single Star Power, Gadget or Gear with win rates of Brawlers who own none.
To find out which Star Power, Gadget or Gear are truly beneficial, the comparison is done using a statistical test.
A Star Power, Gadget or Gear is considered beneficial when the win rate is significantly higher with it than without it, which means that the difference is not likely due to chance.
` + (bestStarPowerLines.length > 0 ?
`The best Star Powers to play on ${mapName} are:

${bestStarPowerLines}
` : '') + (bestGadgetLines.length > 0 ?
`The best Gadgets to play on ${mapName} are:

${bestGadgetLines}
` : '') + (bestGearLines.length > 0 ?
`The best Gears to play on ${mapName} are:

${bestGearLines}
` : '') + (
  bestStarPowerLines.length == 0 || bestGadgetLines.length == 0 || bestGearLines.length == 0 ?
`There is not enough data to determine the best ${bestStarPowerLines.length > 0 ? '' : 'Star Power, '}${bestGadgetLines.length > 0 ? '' : 'Gadget, '}${bestGearLines.length > 0 ? '' : 'Gear, '}to play on ${mapName}.
Brawl Time Ninja continuously collects data, so you can use the dashboard to get the latest information or come back at a later date to read an updated analysis.
You should also consider builds that work well in ${modeName}.
` : '')
      }
    }, {
      text: `## Best Teams on ${mapName}`,
    }, {
      text: async () => {
        const bestTeamsLines = (await this.$klicker.query({
          cubeId: 'battle',
          dimensionsIds: ['team'],
          metricsIds: ['wins'],
          slices: {
            ...slices,
            teamSizeGt: mode[0] == 'duoShowdown' ? ['1'] : ['2'],
          },
          sortId: 'wins',
          limit: 5,
        })).data.map(r => ({
          team: r.dimensions.team,
          wins: r.metrics.wins,
        })).map((d, index) => `${index+1}. ${d.team}: ${d.wins} wins`)
        .join('\n')

        return '' +
`A Team consists of multiple Brawlers.
Brawlers interact with each other, so a weak Brawler can be very good in the right team.
There are many possible team compositions, most are played very rarely or never, so it is difficult to determine the best team overall.
Brawl Time Ninja uses the number of wins to find the best teams, because Teams which are popular and successful will have a high number of wins.

The best Teams to play on ${mapName} based on their number of wins are:

${bestTeamsLines}`
      },
    }, {
      text: `## Best Players on ${mapName}`,
    }, {
      text: async () => {
        const isShowdown = mode.toLowerCase().includes('showdown')
        let bestPlayersLines: string

        if (isShowdown) {
          bestPlayersLines = (await this.$klicker.query({
            cubeId: 'battle',
            dimensionsIds: ['player'],
            metricsIds: ['picks', 'rank', 'brawler'],
            slices,
            sortId: 'picks',
            limit: 5,
          })).data.map(r => ({
            player: r.dimensions.player,
            plays: r.metrics.picks,
            rank: r.metrics.rank,
            brawler: r.metrics.brawler,
          })).map((d, index) => `${index+1}. ${d.player}: ${d.plays} battles (${d.rank} average rank), playing mostly ${d.brawler}`)
          .join('\n')
        } else {
          bestPlayersLines = (await this.$klicker.query({
            cubeId: 'battle',
            dimensionsIds: ['player'],
            metricsIds: ['wins', 'winRate', 'brawler'],
            slices,
            sortId: 'wins',
            limit: 5,
          })).data.map(r => ({
            player: r.dimensions.player,
            playerTag: r.dimensionsRaw.player.tag,
            wins: r.metrics.wins,
            winRate: r.metrics.winRate,
            brawler: r.metrics.brawler,
          })).map((d, index) => `${index+1}. ${d.player}: ${d.wins} wins (${d.winRate} win rate), playing mostly ${d.brawler}`)
          .join('\n')
        }

        return '' +
`You should consider Brawlers that are played by players who are very successful on ${mapName}.
The Players with the most wins on ${mapName} and the Brawler that they played the most are:

${bestPlayersLines}`
      },
    }, {
      text: `## Disclaimer`,
    }, {
      text:
`The data by Brawl Time Ninja may not be representative for the whole player base of Brawl Stars.
Individual factors are important factors of a player's performance.
This summary is automatically generated, it can only describe the statistics but not explain them.
${fandomModeData != undefined ? `This page uses material from the [${modeName}](${fandomModeData.attribution}) article on the Brawl Stars wiki at Fandom and is licensed under the Creative Commons Attribution-Share Alike License.` : ''}`
    }]

    const systemPrompt =
`The app Brawl Time Ninja tracks statistics for players of the game Brawl Stars. You are a content editor for its blog.
Repeat the given Markdown article, but update the wording of the paragraphs so that they use informal, child-friendly, professional language, and translate it to the '${locale.iso}' language.
Do not translate "${modeName}" or "${mapName}".`

    return {
      system: systemPrompt,
      user: prompts,
    }
  }
}
