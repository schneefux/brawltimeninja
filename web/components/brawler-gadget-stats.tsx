import Vue, { PropType } from 'vue'
import { GadgetMetaStatistics } from '~/model/Api'
import { metaStatMaps, capitalize } from '~/lib/util'

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
    descriptions: {
      type: Object as PropType<{ [key: string]: string }|null>,
      required: false
    },
  },
  render(h, { props }) {
    const brawlerId = props.brawlerId
    // TODO update brawler endpoint to return this data
    const gadgets = props.gadgetMeta
        .filter(entry => entry.brawlerName === brawlerId)
        .sort((e1, e2) => e2.sampleSize - e1.sampleSize)
    const gadgetNames = gadgets.map(s => s.gadgetName)

    return <div class="flex flex-wrap justify-center">
      { gadgets.map(gadget =>
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
      ) }

      { props.descriptions != null ?
      <div class="w-full">
        <dl>
          { Object.entries(props.descriptions)
              .filter(([id, description]) => gadgetNames.includes(id))
              .map(([id, description]) =>
            <div key={id} class="mt-1">
              <dt class="inline font-semibold mr-1">{ capitalize(id.toLowerCase()) }</dt>
              <dd class="inline">
                { description }
              </dd>
            </div>
          ) }
        </dl>
      </div>
      : '' }
    </div>
  }
})
