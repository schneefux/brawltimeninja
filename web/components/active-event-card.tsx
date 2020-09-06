import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntrySorted, relativeTimeUntil } from '../lib/util'
import { ActiveEvent } from '~/model/Api'
import EventCard from '~/components/event-card'

export default Vue.extend({
  functional: true,
  props: {
    event: {
      type: Object as PropType<ActiveEvent>,
      required: true
    },
    upcoming: {
      type: Boolean,
      required: true
    },
    bestBrawlers: {
      type: Array as PropType<MetaGridEntrySorted[]>,
      default: []
    },
  },
  render(h, { props }) {
    const slots = {
      infobar: () => <p class="text-right">
        { props.upcoming ?
          'starts in ' + relativeTimeUntil(props.event.start) :
          'ends in ' + relativeTimeUntil(props.event.end)
        }
      </p>,
      actions: () => <div class="flex justify-end">
        <nuxt-link
          to={`/tier-list/map/${props.event.id}`}
          class="button button--md"
        >
          Open
        </nuxt-link>
      </div>,
      content: () => <div class="brawler-avatars my-4">
        { props.bestBrawlers.slice(0, 5).map(brawler =>
          <div
            key={brawler.id}
            class="brawler-avatars__element"
          >
            <div class="brawler-avatar">
              <media-img
                path={`/brawlers/${brawler.id}/avatar`}
                size="160"
                clazz="brawler-avatar__img"
              ></media-img>
              <p class="brawler-avatar__stats">
                { metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }
                { metaStatMaps.labelsShort[brawler.sortProp] }
              </p>
            </div>
          </div>
        ) }
      </div>,
    }

    const eventCard = EventCard as any
    return <eventCard
      mode={props.event.mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join('')}
      map={props.event.map}
      id={props.event.id}
      scopedSlots={slots}
    >
    </eventCard>
  }
})
