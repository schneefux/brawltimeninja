import Vue from 'vue'
import { brawlerId } from '~/lib/util'

export default Vue.extend({
  functional: true,
  props: {
    title: {
      type: String,
      required: true,
    },
    brawler: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
  },
  render(h, { props, scopedSlots }) {
    return <div class="card w-80 max-w-full bg-primary-darker mx-auto relative">
      <div class="relative">
        <div class="z-10 absolute left-0 ml-1 mt-1 w-5/12">
          <div class="bg-gray-800 bg-opacity-75 rounded-lg px-2 w-fit-content">
            <span class="font-semibold text-white text-2xl text-shadow">
              { props.title }
            </span>
          </div>
        </div>
        <media-img
          path={'/brawlers/' + brawlerId({ name: props.brawler }) + '/avatar'}
          alt={props.brawler}
          size="160"
          clazz="z-0 absolute bottom-0 h-20"
        ></media-img>
        { props.icon !== '' ?
          <media-img
            path={props.icon}
            alt={props.title}
            size="80"
            clazz="absolute bottom-0 h-10 rounded-full p-1 ml-20 bg-gray-800 bg-opacity-50"
          ></media-img>
          : ''
        }
        <div class="py-2 pr-3 flex flex-col justify-center items-end">
          <div>
            { scopedSlots.stats({}) }
          </div>
          { 'link' in scopedSlots ?
            scopedSlots.link({})
          : '' }
        </div>
      </div>
      { 'expand' in scopedSlots ? scopedSlots.expand({}) : '' }
    </div>
  }
})
