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
    },
    map: {
      type: String,
    },
    id: {
      // enables map icon top right
      type: [String, Number],
    },
    size: {
      // class
      type: String,
      default: 'w-80',
    },
    nobackground: {
      type: Boolean,
      default: false
    },
  },
  render(h, { props, scopedSlots }) {
    const slots = {
      ...scopedSlots,
      ...(props.id != undefined && props.id != 0 ? {
        preview: () => <media-img
            path={`/maps/${props.id}`}
            size="80"
            clazz="h-12"
          ></media-img>,
      } : {}),
    }

    const card = Card as any
    return <card
      title={props.mode != undefined ? formatMode(props.mode) : undefined}
      title-link={props.mode != undefined ? `/tier-list/mode/${camelToKebab(props.mode)}` : undefined}
      subtitle={props.map}
      subtitle-link={props.map != undefined ? `/tier-list/mode/${camelToKebab(props.mode)}/map/${slugify(props.map)}` : undefined}
      background={props.nobackground ? undefined : '/modes/' + props.mode + '/background'}
      icon={props.mode != undefined ? '/modes/' + props.mode + '/icon' : undefined}
      size={props.size}
      color={props.mode != undefined ? 'color-' + props.mode.toLowerCase() : undefined}
      scopedSlots={slots}
    ></card>
  }
})
