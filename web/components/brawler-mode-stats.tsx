import Vue, { PropType } from 'vue'
import { formatMode, metaStatMaps, camelToKebab } from '~/lib/util';
import { ModeMetaMap, MapMetaMap, MapMeta, ModeMeta } from '~/model/MetaEntry';
import EventCard from '~/components/event-card'

export default Vue.extend({
  functional: true,
  props: {
    // TODO update brawler endpoint to return this data
    modeMeta: {
      type: Object as PropType<ModeMetaMap>,
      required: true
    },
    mapMeta: {
      type: Object as PropType<MapMetaMap>,
      required: false
    },
    brawlerId: {
      type: String,
      required: true
    },
    showAllModes: {
      type: Boolean,
      default: false
    },
  },
  render(h, { props }) {
    interface ModeMetaSelectBrawler extends ModeMeta {
      brawler: ModeMeta['brawlers']['someone']
      modeId: string
    }

    // add current brawler as `.brawler` to map meta and mode meta values
    const maps = Object.entries(props.mapMeta)
        .map(([mapId, map]) => ({
          ...map,
          brawlers: {},
          brawler: map.brawlers[props.brawlerId],
          mapId,
        }))
    const modes = Object.entries(props.modeMeta)
        .map(([modeId, mode]) => ({
          ...mode,
          brawlers: {},
          brawler: mode.brawlers[props.brawlerId],
          modeId,
        }))
        .sort((m1, m2) => m2.sampleSize - m1.sampleSize)

    // filter maps where this brawler has above average win rate
    const aboveAverageWinRateMaps = maps
        .filter(map => map.brawler != undefined && map.brawler.stats.winRate != undefined)
        .filter(map => map.brawler.sampleSize > 300)
        .filter(map => map.brawler.stats.winRate > 0.55) // TODO approx.
    // group { map: { brawlers } } by mode
    const groupByMode = (maps: MapMeta[]) =>
        maps.reduce((group, map) => ({
          ...group,
          [map.mode]: [...(group[map.mode] || []), map],
        }), {} as { [mode: string]: MapMeta[] })

    const mapsByMode = groupByMode(maps)
    const aboveAverageWinRateMapsByMode = groupByMode(aboveAverageWinRateMaps)

    const slots = (mode: ModeMetaSelectBrawler) => ({
      actions: () => <div class="flex justify-end">
        <nuxt-link
          to={`/tier-list/mode/${camelToKebab(mode.mode)}`}
          class="button button-md"
        >
          Open
        </nuxt-link>
      </div>,
      content: () => <div class="my-4 flex">
        <div class="flex justify-center bg-black rounded mx-auto">
          <media-img
            path={`/brawlers/${props.brawlerId}/avatar`}
            size="384"
            clazz="w-16"
          ></media-img>
          { mode.sampleSize > 3000 ?
          <dl class="w-48 px-3 py-2">
            <div class="flex justify-between">
              <dt>Use Rate</dt>
              <dd>{ metaStatMaps.formatters.useRate(mode.brawler.stats.useRate) }</dd>
            </div>
            { mode.brawler.stats.winRate != undefined ?
            <div class="flex justify-between">
              <dt>Win Rate</dt>
              <dd>{ metaStatMaps.formatters.winRate(mode.brawler.stats.winRate) }</dd>
            </div>
            : '' }
            { mode.modeId in mapsByMode ?
            <div class="flex justify-between">
              <dt>Good Maps</dt>
              <dd>{ (aboveAverageWinRateMapsByMode[mode.modeId]||[]).length }/{ mapsByMode[mode.modeId].length }</dd>
            </div>
            : '' }
          </dl>
          : '' }
        </div>
      </div>,
    })

    const eventCard = EventCard as any
    return <div class="overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
      { modes.map((mode, index) =>
      <lazy
        key={mode.mode}
        render={props.showAllModes || index <= 2}
        class={{
          'md:hidden': !props.showAllModes && index > 2,
          'mx-4': true,
        }}
        distance="600px"
      >
        <div class="w-80" style="height: 221px" slot="placeholder"></div>
        <eventCard
          mode={mode.mode}
          scopedSlots={slots(mode)}
        ></eventCard>
      </lazy>
      ) }
    </div>
  }
});
