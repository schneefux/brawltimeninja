import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      open: false,
    }
  },
  render(h) {
    const title = this.title
    const description = this.description
    const open = this.open

    return <div class="card-wrapper">
      <div class="card card--dark card__content h-full">
        <h3 class="card__header">
          { title }
        </h3>

        <p class="card__text">
          { description }
        </p>

        <div class="mt-2">
          { this.$scopedSlots.default!({ open }) }
        </div>

        <div
          class="mt-3 flex justify-center"
          key={open}
        >
          {
          /*
            key forces Vue to render two distinct
            elements for open and close.
            On re-render, the browser will add the new
            button below the slot.
            Without key, the content is added above the
            existing slot,
            effectively pushing the scroll position down.
          */
          }
          <button
            class="button button--md"
            onClick={() => this.open = !open}
          >
            Show { open ? 'Less' : 'More' }
          </button>
        </div>
      </div>
    </div>
  }
})
