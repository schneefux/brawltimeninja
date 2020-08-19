import Vue, { PropType } from 'vue'
import { formatMode, metaStatMaps, getBestBrawlers, capitalize } from '~/lib/util'
import { MapMetaMap, MapMeta } from '~/model/MetaEntry'
import { Brawler } from '~/model/Api'
import { PlayerModeStats } from '~/model/Web'


export default Vue.extend({
  functional: true,
  name: 'Event',
  props: {
    stats: {
      type: Object as PropType<PlayerModeStats>,
      required: true
    },
    mode: {
      type: String,
      required: true,
    },
    playerBrawlers: {
      type: Array as PropType<Brawler[]>,
      required: true,
    },
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      required: true,
    },
  },
  render(h, { props }) {
    // TODO there might be a second one when Power Play is online
    const activeMap = Object.entries(props.activeMapMeta).filter(([id, meta]) => meta.mode == props.mode)[0]
    let eventId = undefined as undefined|string
    let meta = undefined as undefined|MapMeta

    let recommendedBrawlers = [] as string[]
    if (activeMap !== undefined) {
      eventId = activeMap[0] as string
      meta = activeMap[1] as MapMeta

      // score =
      //   index [ brawlers owned by player, worst first ]
      //     *
      //   index [ brawler in map meta, best first ]
      const worstBrawlers = props.playerBrawlers.slice()
        .sort((b1, b2) => b1.trophies - b2.trophies)
      const bestBrawlers = getBestBrawlers(Object.values(meta.brawlers))
      recommendedBrawlers = worstBrawlers
        .map((worstBrawler) => {
          const bestBrawlerIndex = bestBrawlers.findIndex(b => b.name.toLowerCase() == worstBrawler.name.toLowerCase())
          return {
            brawler: worstBrawler,
            score: (worstBrawler.trophies + 1) * (bestBrawlerIndex / bestBrawlers.length + 1),
          }
        })
        .sort((r1, r2) => r1.score - r2.score)
        .map((r) => r.brawler.name.toLowerCase())
        .slice(0, 3)
    }

    const mode = props.mode
    return <div
      style={{
        'background-image': `linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.25)), url('${process.env.mediaUrl}/modes/${mode}/background.jpg?size=1024')`,
      }}
      class="card bg-center bg-cover h-full relative"
    >
      <div class="card-content">
        <div class="card-header text-white">
          { formatMode(mode) }
        </div>
        <dl class="flex card-props">
          <dd class="card-prop-value">{ metaStatMaps.formatters.winRate(props.stats.winRate) }</dd>
          <dt class="ml-1 card-prop-label">{ metaStatMaps.labels.winRate }</dt>
        </dl>
        <p class="text-xs">{ props.stats.wins } Wins / { props.stats.losses } Losses</p>
        { recommendedBrawlers.length > 0 ?
        <div class="flex justify-between md:flex-row-reverse md:justify-end mt-3 h-24">
          <div class="md:ml-2 w-full">
            <div>
              <h6 class="font-semibold">{ meta?.map }</h6>
              <p class="text-xs">Recommended for you:</p>
            </div>
            <ol class="flex mt-1 w-32">
            { recommendedBrawlers.map((brawler) =>
              <li class="flex-shrink-0 w-10 h-12 leading-none mr-2 bg-black text-center">
                <media-img
                  path={'/brawlers/' + brawler + '/avatar'}
                  size="80"
                  alt={brawler}
                  clazz="h-8"
                ></media-img>
                <span class="text-xs">{ capitalize(brawler) }</span>
              </li>
            ) }
            </ol>
          </div>
          <div class="w-24 flex flex-col justify-center">
            <media-img
              path={'/maps/' + eventId}
              size="384"
              clazz="px-1"
              ztyle="max-height: 100%;"
            ></media-img>
          </div>
        </div>
        : '' }
      </div>
      <div class="absolute top-0 right-0 mr-6 my-4">
        <media-img
          path={'/modes/' + mode + '/icon'}
          size="120"
          clazz="w-12 mr-1"
          alt={mode}
        ></media-img>
      </div>
    </div>
  },
})
