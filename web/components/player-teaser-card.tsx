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
    pages: {
      type: Number,
      default: 1
    },
  },
  data() {
    return {
      page: 0,
    }
  },
  render(h) {
    const title = this.title
    const description = this.description
    const pages = this.pages
    const page = this.page

    const expand = () => this.page++
    const collapse = () => {
      this.page = 0
      // after collapse, scroll the page up
      // so that the more/less buttons are at the same position again
      // (undoing the {key} hack)
      const offset = -(this.$refs['top'] as HTMLElement).getBoundingClientRect().top
      // get the ref again
      // because the element has been rerendered with the {key} hack!
      this.$nextTick(() => this.$scrollTo(this.$refs['top'] as HTMLElement, 0, { offset }))
    }

    return <div class="card-wrapper">
      <div class="card card--dark card__content h-full">
        <h3 class="card__header">
          { title }
        </h3>

        <p class="card__text">
          { description }
        </p>

        <div class="mt-2" ref="content">
          { this.$scopedSlots.default!({ open: page > 0, page }) }
        </div>

        <div
          class="mt-3 flex justify-center"
          key={page}
          ref="top"
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
          { page > 0 ?
          <button
            class="button button--md mx-2"
            onClick={collapse}
          >
            Show Less
          </button>
          : '' }
          { page < pages ?
          <button
            class="button button--md mx-2"
            onClick={expand}
          >
            Show More
          </button>
          : '' }
        </div>
      </div>
    </div>
  }
})
