import Vue from 'vue'

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
    return <div class="card stats-card">
      <div class="relative">
        <div class="z-10 absolute left-0 ml-1 mt-1 w-5/12">
          <div class="bg-black bg-opacity-75 rounded-lg px-2">
            <span class="font-semibold text-white text-2xl text-shadow capitalize ">
              { props.title.toLowerCase() }
            </span>
          </div>
        </div>        <media-img
          path={'/brawlers/' + props.brawler + '/avatar'}
          size="160"
          clazz="stats-card-image"
        ></media-img>
        { props.icon !== '' ?
          <media-img
            path={props.icon}
            size="80"
            clazz="stats-card-icon"
          ></media-img>
          : ''
        }
        <div class="stats-card__content">
          <div>
            { scopedSlots.stats({}) }
          </div>
        </div>
      </div>
      { 'expand' in scopedSlots ? scopedSlots.expand({}) : '' }
    </div>
  }
})
