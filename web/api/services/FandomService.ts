import wtf from 'wtf_wikipedia'
// @ts-ignore
import wtfPluginApi from 'wtf-plugin-api'
import { Cache } from '~/lib/cache'

wtf.extend(wtfPluginApi)
const wtfOpts = { domain: 'brawlstars.fandom.com', path: 'api.php' }

const FANDOM_CACHE_MINUTES = 60 * 24

export interface FandomModeData {
  attribution: string
  shortDescription: string
  fullDescription: string
  tips: string[]
  brawlerTips: Record<string, string>
}

export default class FandomService {
  private modeCache = new Cache<string, FandomModeData|undefined>(FANDOM_CACHE_MINUTES)

  async cachedGetModeData(modeName: string) {
    return await this.modeCache.getOrUpdate(modeName, async () => {
      console.log('Updating fandom mode cache for', modeName)

      const data = await this.getModeData(modeName)
      if (data == undefined) {
        console.log('No fandom mode data for', modeName)
      }

      return data
    })
  }

  private async getModeData(modeName: string): Promise<FandomModeData|undefined> {
    const modePage: any = await wtf.fetch(modeName, wtfOpts)
    if (modePage == null) {
      // does not exist
      return undefined
    }

    const description: string = modePage.section('').text()
    const shortDescription: string = description.split('\n')[0].replaceAll('"', '')
    const fullDescription: string = description.split('\n')[0]

    const brawlerTips: Record<string, string> = Object.fromEntries(modePage
      .section('Useful Brawlers')
      .list(0)
      .lines()
      .map((l: any) => l.text())
      .map((l: string) => {
        const groups = l.match(/^(\w+): (.*)$/)
        if (groups == null) {
          return []
        }
        return [groups[1], groups[2]]
      })
      .filter((l: string[]) => l.length > 0)
    )

    const tips = modePage
      .section('Tips')
      .list(0)
      .lines()
      .map((l: any) => l.text())

    return {
      attribution: modePage.url(),
      shortDescription,
      fullDescription,
      tips,
      brawlerTips,
    }
  }
}
