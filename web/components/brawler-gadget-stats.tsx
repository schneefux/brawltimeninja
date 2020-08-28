import Vue, { PropType } from 'vue'
import { GadgetMetaStatistics } from '~/model/Api'
import { metaStatMaps } from '~/lib/util'

export default Vue.extend({
  functional: true,
  props: {
    gadgetMeta: {
      type: Array as PropType<GadgetMetaStatistics[]>,
      required: true,
    },
    brawlerId: {
      type: String,
      required: true
    },
  },
  render(h, { props }) {
    const brawlerId = props.brawlerId
    // TODO update brawler endpoint to return this data
    const gadgets = props.gadgetMeta
        .filter(entry => entry.brawlerName === brawlerId)
        .sort((e1, e2) => e2.sampleSize - e1.sampleSize)

    return gadgets.map(gadget =>
        <div key={gadget.id} class="card-wrapper">
          <div class="card prop-card prop-card-md w-48 bg-gray-800">
            <span class="prop-card-title capitalize">
              { gadget.gadgetName.length > 0 ? gadget.gadgetName.toLowerCase() : 'No Gadget' }
            </span>
            { gadget.gadgetName.length > 0 ?
            <media-img
              path={'/gadgets/' + gadget.id}
              size="96"
              clazz="prop-card-image"
            ></media-img>
            :
            <media-img
              path={'/brawlers/' + brawlerId + '/avatar'}
              size="96"
              clazz="prop-card-image"
            ></media-img>
            }
            <dl class="prop-card-content prop-card-content-md">
              <div>
                <span class="card-prop-icon">
                  { metaStatMaps.icons.winRate }
                </span>
                <dd class="card-prop-value inline">
                  { metaStatMaps.formatters.winRate(gadget.stats.winRate) }
                </dd>
              </div>
              <dt class="text-sm">
                { metaStatMaps.labels.winRate }
              </dt>
            </dl>
          </div>
        </div>
    )
  }
})
