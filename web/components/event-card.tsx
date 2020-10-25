import Vue from 'vue'
import { camelToKebab, formatMode, slugify } from '../lib/util'
import Card from '~/components/card'

export default Vue.extend({
  functional: true,
  name: 'EventCard',
  props: {
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: false
    },
    id: {
      // enables map icon top right
      type: String,
      required: false,
    },
    size: {
      // class
      type: String,
      default: 'w-80',
    },
  },
  render(h, { props, scopedSlots }) {
    const slots = {
      ...scopedSlots,
      preview: () => <media-img
          path={`/maps/${props.id}`}
          size="80"
          clazz="h-12"
        ></media-img>,
    }

    const card = Card as any
    return <card
      title={formatMode(props.mode)}
      title-link={props.mode != undefined ? `/tier-list/mode/${camelToKebab(props.mode)}` : undefined}
      subtitle={props.map}
      subtitle-link={props.map != undefined ? `/tier-list/mode/${camelToKebab(props.mode)}/map/${slugify(props.map)}` : undefined}
      background={'/modes/' + props.mode + '/background'}
      icon={'/modes/' + props.mode + '/icon'}
      size={props.size}
      color={'color-' + props.mode.toLowerCase()}
      scopedSlots={slots}
    ></card>
  }
})
