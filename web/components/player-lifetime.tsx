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
    return <dl class="flex flex-wrap flex-col md:flex-row justify-center">
      { Object.entries(stats).filter(([name, value], index) => !props.tease || index < 3).map(([name, value]) =>
        <div class="bg-black rounded px-3 py-1 mx-2 mt-1 text-lg flex h-8">
          <dd class="text-primary-light font-semibold w-16 md:w-auto text-right">{ value }</dd>
          <dt class="ml-2 w-full">{ metaStatMaps.labels[name] }</dt>
        </div>
      )}
    </dl>
    }
  })
