import Vue, { PropType } from 'vue'
import { PlayerLifetimeStats } from '~/model/Api'
import { metaStatMaps } from '~/lib/util.ts'

export default Vue.extend({
  functional: true,
  props: {
    stats: {
      type: Object as PropType<PlayerLifetimeStats>,
      required: true,
    },
    tease: {
      type: Boolean,
      default: false
    },
  },
  render(h, { props }) {
    const stats = props.stats
    const tease = props.tease
    return <dl
      class={{
        'flex flex-col md:flex-row md:flex-wrap md:justify-center': true,
        'flex-wrap justify-center': !tease,
        'h-28 md:h-10 overflow-hidden': tease,
      }}
    >
      { Object.entries(stats).map(([name, value]) =>
        <div class="bg-gray-900 rounded px-3 py-1 mx-2 mt-1 text-lg flex flex-shrink-0 h-8">
          <dd class="text-primary-light font-semibold w-16 md:w-auto text-right">{ value }</dd>
          <dt class="ml-2 w-full overflow-hidden">{ metaStatMaps.labels[name] }</dt>
        </div>
      )}
    </dl>
    }
  })
