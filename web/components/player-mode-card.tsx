import Vue, { PropType } from 'vue'
import { formatMode } from '~/lib/util'

export default Vue.extend({
  functional: true,
  name: 'Event',
  props: {
    stats: {
      type: Object as PropType<{ [id: string]: { value: number, label: string } }>,
      required: true
    },
    mode: {
      type: String,
      required: true,
    },
  },
  render(h, { props }) {
    const mode = props.mode.replace('3v3', 'gemGrab')
    // TODO remove transform hack
    return <div class="card bg-center bg-cover h-full">
      <div class="relative z-0">
        <media-img
          path={'/modes/' + mode + '/background'}
          clazz="absolute left-0 top-0 h-32"
          ztyle="filter: brightness(0.5) grayscale(0.25); transform: scaleX(1.75) scaleY(1.75);"
          size="1600"
        ></media-img>
      </div>
      <div class="relative z-10 card-content">
        <div class="card-header text-white">
          { formatMode(mode) }
        </div>
        <ul>
          { Object.entries(props.stats).map(([name, stat]) =>
            <li
              key={name}
              class="card-props"
            >
              <span class="card-prop-value">{ stat.value }</span>
              <span class="ml-1 card-prop-label">{ stat.label }</span>
            </li>
          ) }
        </ul>
      </div>
      <media-img
        path={'/modes/' + mode + '/icon'}
        size="120"
        clazz="w-8 absolute top-0 right-0 h-12 self-center mr-6 my-4"
      ></media-img>
    </div>
  },
})
