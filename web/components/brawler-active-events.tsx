import Vue, { PropType } from 'vue'
import { metaStatMaps, relativeTimeUntil } from '../lib/util'
import EventCard from '~/components/event-card'
import { ActiveEvent } from '~/model/Api'
import { MapMetaMap, MapMeta } from '~/model/MetaEntry'

export default Vue.extend({
  functional: true,
  props: {
    activeEvents: {
      type: Array as PropType<ActiveEvent[]>,
      default: {}
    },
    mapMeta: {
      type: Object as PropType<MapMetaMap>,
      default: {}
    },
    brawlerId: {
      type: String,
      required: true
    },
    showAllMaps: {
      type: Boolean,
      default: false
    },
    totalBrawlers: {
      type: Number,
      required: true
    },
  },
  render(h, { props }) {
    interface MapStats extends MapMeta, ActiveEvent {
      brawler: MapMeta['brawlers']['someone']|undefined
    }

    const maps = Object.values(props.activeEvents)
      .filter(event => event.id in props.mapMeta)
      .map(event => ({
        ...event,
        ...props.mapMeta[event.id],
        brawler: props.mapMeta[event.id].brawlers[props.brawlerId],
      }) as MapStats)
      .sort((e1, e2) => (e2.brawler != undefined ? e2.brawler.sampleSize : 0) - (e1.brawler != undefined ? e1.brawler.sampleSize : 0))

    const slots = (event: MapStats) => ({
      infobar: () => <p class="text-right">
          ends in { relativeTimeUntil(event.end) }
      </p>,
      actions: () => <div class="flex justify-end">
        <nuxt-link
          to={`/tier-list/map/${event.id}`}
          class="button button--md"
        >
          Open
        </nuxt-link>
      </div>,
      content: () => <div class="my-4 flex">
        <div class="flex justify-center bg-black rounded mx-auto">
          <div class="flex flex-col justify-end mr-2">
            <media-img
              path={`/brawlers/${props.brawlerId}/avatar`}
              alt={event.brawler?.name}
              size="128"
              clazz="w-16"
            ></media-img>
          </div>
          { event.brawler != undefined && event.sampleSize > 3000 ?
          <dl class="w-48 px-3 py-2">
            <div class="flex justify-between">
              <dt>Use Rate</dt>
              <dd>{ metaStatMaps.formatters.useRate(event.brawler.stats.useRate) }</dd>
            </div>
            { event.brawler.stats.winRate != undefined ?
            <div class="flex justify-between">
              <dt>Win Rate</dt>
              <dd>{ metaStatMaps.formatters.winRate(event.brawler.stats.winRate) }</dd>
            </div>
            : '' }
            { event.brawler.stats.winRate != undefined ?
            <div class="flex justify-between">
              <dt>Above Average</dt>
              <dd>{ event.brawler.stats.winRate * event.brawler.stats.useRate > 0.55 * 1.0/props.totalBrawlers ? 'Yes' : 'No' }</dd>
            </div>
            : '' }
          </dl>
          : <p class="m-auto">No data yet.</p> }
        </div>
      </div>,
    })

    const eventCard = EventCard as any
    return <div class="overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
      { maps.map((map, index) =>
      <lazy
        key={map.mode + ' ' + map.map}
        render={props.showAllMaps || index <= 2}
        class={{
          'md:hidden': !props.showAllMaps && index > 2,
          'mx-4': true,
        }}
        distance="600px"
      >
        <div class="w-80" style="height: 230px" slot="placeholder"></div>
        <eventCard
          mode={map.mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join('')}
          map={map.map}
          id={map.id}
          scopedSlots={slots(map)}
        ></eventCard>
      </lazy>
      ) }
    </div>
  }
})
