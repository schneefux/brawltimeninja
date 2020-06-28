import Vue from 'vue'
import { formatMode } from '../lib/util'

export default Vue.extend({
  functional: true,
  name: 'Event',
  props: {
    mode: {
      type: String,
      required: true
    },
    map: {
      type: String,
      required: false
    },
    id: { // enables map icon top right
      type: String,
      required: false,
    },
    infobar: {
      type: Boolean,
      default: false
    },
    actions: {
      type: Boolean,
      default: false
    },
    size: {
      type: String, // class
      default: 'w-80 md:w-100',
    },
  },
  render(h, { props, slots }) {
    return <div class="card-wrapper">
      <div class="card">
        { props.infobar ?
          <div class="bg-black text-primary-lightest w-full px-2 py-1 text-lg font-semibold">
            { slots().infobar }
          </div>
          : ''
        }
        <div
          class={'w-full px-3 py-2 flex font-semibold justify-between items-center ' + `bg-color-${props.mode.toLowerCase()}`}
        >
          <div class="flex items-center">
            <div class="w-10 h-10 my-1 flex justify-center items-center">
              <media-img path={'/modes/' + props.mode + '/icon'}
                size="120"
              ></media-img>
            </div>
            <div class="ml-3 text-white">
              <p class="text-xl">
                { formatMode(props.mode) }
              </p>
              { props.map !== undefined ?
                <p>{ props.map }</p>
                : ''
              }
            </div>
          </div>
          { props.id ?
            <media-img
              path={`/maps/${props.id}`}
              size="80"
              clazz="h-12"
            ></media-img>
            : ''
          }
        </div>
        <div class="relative z-0">
          <media-img path={'/modes/' + props.mode + '/background'}
            size="800"
            clazz="absolute left-0 top-0 h-32"
            ztyle="filter: brightness(0.75) grayscale(0.25);"
          ></media-img>
        </div>
        <div class={'relative z-10 mx-auto ' + props.size}>
          { slots().content }
        </div>
        { props.actions ?
          <div class="relative z-10 bg-black text-primary-lightest w-full px-3 py-2 font-semibold">
            { slots().actions }
          </div>
          : ''
        }
      </div>
    </div>
  }
})
