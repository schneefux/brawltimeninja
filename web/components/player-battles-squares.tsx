import Vue, { PropType } from 'vue'
import { Battle } from '~/model/Api'

export default Vue.extend({
  functional: true,
  props: {
    battles: {
      type: Array as PropType<Battle[]>,
      default: () => []
    },
    tease: {
      type: Boolean,
      default: false
    },
  },
  render(h, { props }) {
    const battles = props.battles
    const tease = props.tease

    return <div
      class={{
        'flex flex-wrap justify-center': true,
        'h-12 overflow-y-hidden': tease,
      }}>
      { battles.map((battle, index) =>
      <div
        key={battle.timestamp}
        class={{
          'rounded-l border-l-2': index == 0,
          'rounded-r': index == battles.length - 1,
          'bg-red-500': battle.victory === false,
          'bg-green-500': battle.victory === true,
          'bg-gray-400': battle.victory == undefined,
          'border-r-2 border-t-2 border-b-2 border-gray-900 w-12 h-12 flex justify-center items-center': true,
        }}
      >
        <media-img
          path={'/modes/' + battle.event.mode + '/icon'}
          size="120"
          clazz="w-8 mx-auto my-auto"
        ></media-img>
      </div>
      ) }
    </div>
  }
})
