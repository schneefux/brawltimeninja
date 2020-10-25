import Vue from 'vue'

export default Vue.extend({
  functional: true,
  name: 'Card',
  props: {
    size: {
      type: String, // class
      default: 'w-80',
    },
    title: {
      type: String,
      required: false
    },
    titleLink: {
      type: String,
      required: false
    },
    subtitle: {
      type: String,
      required: false
    },
    subtitleLink: {
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
    pages: {
      type: Number,
      required: false
    },
  },
  render(h, { props, scopedSlots }) {
    const content = ({ open, page }: {open: boolean, page: number}) => {
      return <div>
        { 'infobar' in scopedSlots ?
          <div class="text-primary-lightest bg-gray-900 w-full px-2 py-1 text-lg font-semibold">
            { scopedSlots.infobar({}) }
          </div>
        : ''
        }
        { props.title != undefined || props.icon != undefined || 'preview' in scopedSlots ?
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
              { props.title != undefined ?
                <div class="ml-3 text-white">
                  { props.titleLink != undefined ?
                    <router-link to={props.titleLink} class="block text-xl">
                      { props.title }
                    </router-link>
                  :
                    <p class="text-xl">
                      { props.title }
                    </p>
                  }
                  { props.subtitle != undefined && props.subtitleLink == undefined ?
                    <p class="text-xl">
                      { props.subtitle }
                    </p>
                  : ''
                  }
                  { props.subtitle != undefined && props.subtitleLink != undefined ?
                    <router-link to={props.subtitleLink} class="block text-xl">
                      { props.subtitle }
                    </router-link>
                  : ''
                  }
                </div>
              : ''
              }
            </div>
            { 'preview' in scopedSlots ? scopedSlots.preview({}) : '' }
          </div>
          : ''
        }
        { props.background !== undefined ?
          <div class="relative z-0">
            <media-img path={props.background}
              size="800"
              clazz="absolute left-0 top-0 h-32"
              ztyle="filter: brightness(0.75) grayscale(0.25);"
            ></media-img>
          </div>
          : ''
        }
        <div class={'relative z-10 mx-auto ' + props.size}>
          { scopedSlots.content({ open, page }) }
        </div>
        { 'actions' in scopedSlots ?
          <div class="relative z-10 bg-gray-800 text-primary-lightest w-full px-3 py-2 font-semibold">
            { scopedSlots.actions({}) }
          </div>
          : ''
        }
      </div>
    }

    return <div class="card-wrapper">
      { props.pages != undefined ?
        <accordeon
          class="card card--dark"
          pages={props.pages}
          scopedSlots={{ default: content }}
        ></accordeon>
      :
        <div class="card card--dark">
          { content({ open: true, page: 0 }) }
        </div>
      }
    </div>
  }
})
