import Vue, { PropType } from 'vue'
import { metaStatMaps, capitalize } from '../lib/util'
import Card from '~/components/card'
import { BrawlerMetaStatistics } from '~/model/Web'

export default Vue.extend({
  functional: true,
  name: 'BestStarpowersCard',
  props: {
    topStarpowers: {
      type: Object as PropType<{ [prop: string]: BrawlerMetaStatistics }>,
      required: true
    },
    kind: {
      type: String, // 'starpowers' or 'gadgets'
      default: 'starpowers'
    },
  },
  render(h, { props }) {
    const slots = {
      actions: () => <div class="flex justify-end">
        <nuxt-link
          to={`/tier-list/${props.kind}`}
          class="button button-md"
        >
          Open
        </nuxt-link>
      </div>,
      content: () => <div class="brawler-avatars my-4">
        { Object.entries(props.topStarpowers).map(([prop, entry]) =>
          <div
            key={prop}
            style={`width: ${100 / Object.keys(props.topStarpowers).length}%`}
            class="brawler-avatars__element"
          >
            <div class="brawler-avatar">
              <media-img
                path={`/${props.kind}/${entry.id}`}
                size="160"
                clazz="brawler-avatar__img"
              />
              <p class="brawler-avatar__stats">
                { metaStatMaps.formatters[prop](entry.stats[prop]) }
                &nbsp;
                { metaStatMaps.labelsShort[prop] }
              </p>
            </div>
          </div>
        ) }
      </div>
    }

    const card = Card as any
    return <card
        title={`Best ${capitalize(props.kind)}`}
        size="w-64"
        scopedSlots={slots}
      >
      </card>
  }
})
