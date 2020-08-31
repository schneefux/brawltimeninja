import Vue, { PropType } from 'vue'
import { camelToKebab, metaStatMaps, MetaGridEntrySorted } from '../lib/util'
import EventCard from '~/components/event-card'

export default Vue.extend({
  functional: true,
  name: 'ModeBestBrawlersCard',
  props: {
    mode: {
      type: String,
      required: true
    },
    topBrawlers: {
      type: Array as PropType<MetaGridEntrySorted[]>,
      required: true
    },
  },
  render(h, { props }) {
    const slots = {
      actions: () => <div class="flex justify-end">
        <nuxt-link
          to={`/tier-list/mode/${camelToKebab(props.mode)}`}
          class="button button--md"
        >
          Open
        </nuxt-link>
      </div>,
      content: () => <div class="brawler-avatars my-4">
        { props.topBrawlers.slice(0, 5).map(brawler =>
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
              &nbsp;
              { metaStatMaps.labelsShort[brawler.sortProp] }
            </p>
          </div>
        </div>
        ) }
      </div>,
    }

    const eventCard = EventCard as any
    return <eventCard
      mode={props.mode}
      scopedSlots={slots}
    >
    </eventCard>
  }
})
