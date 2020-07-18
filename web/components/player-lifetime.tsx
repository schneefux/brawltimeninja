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
  },
  render(h, { props }) {
    const stats = props.stats
    return <div>
      <table class="flex flex-wrap flex-col md:flex-row justify-center">
      { Object.entries(stats).map(([name, value]) =>
        <tr class="bg-black rounded px-3 py-1 mx-2 mt-1 text-lg flex h-8">
          <td class="text-primary-light font-semibold block w-16 md:w-auto text-right">{ value }</td>
          <td class="ml-2 block w-full">{ metaStatMaps.labels[name] }</td>
        </tr>
      )}
      </table>
    </div>
    }
  })
