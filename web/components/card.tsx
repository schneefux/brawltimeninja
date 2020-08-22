import Vue from 'vue'

export default Vue.extend({
  functional: true,
  name: 'Card',
  props: {
    size: {
      type: String, // class
      default: 'w-80 md:w-100',
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: false
    },
    background: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: false
    },
    color: {
      type: String,
      required: false
    },
  },
  render(h, { props, scopedSlots }) {
    return <div class="card-wrapper">
      <div class="card bg-black">
        { 'infobar' in scopedSlots ?
          <div class="text-primary-lightest w-full px-2 py-1 text-lg font-semibold">
            { scopedSlots.infobar({}) }
          </div>
          : ''
        }
        <div
          class={'w-full px-3 py-2 flex font-semibold justify-between items-center ' + (props.color !== undefined ? `bg-${props.color}` : '')}
        >
          <div class="flex items-center">
            { props.icon !== undefined ?
              <div class="w-10 h-10 my-1 flex justify-center items-center">
                <media-img path={props.icon}
                  size="120"
                ></media-img>
              </div>
              : ''
            }
            <div class="ml-3 text-white">
              <p class="text-xl">
                { props.title }
              </p>
              { props.subtitle !== undefined ?
                <p>{ props.subtitle }</p>
                : ''
              }
            </div>
          </div>
          { 'preview' in scopedSlots ? scopedSlots.preview({}) : '' }
        </div>
        <div class="relative z-0">
          { props.background !== undefined ?
            <media-img path={props.background}
              size="800"
              clazz="absolute left-0 top-0 h-32"
              ztyle="filter: brightness(0.75) grayscale(0.25);"
            ></media-img>
            : ''
          }
        </div>
        <div class={'relative z-10 mx-auto ' + props.size}>
          { scopedSlots.content({}) }
        </div>
        { 'actions' in scopedSlots ?
          <div class="relative z-10 bg-black text-primary-lightest w-full px-3 py-2 font-semibold">
            { scopedSlots.actions({}) }
          </div>
          : ''
        }
      </div>
    </div>
  }
})
