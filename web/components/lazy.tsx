import Vue from 'vue'

export default Vue.extend({
  name: 'Lazy',
  props: {
    render: {
      // manual override
      type: Boolean,
      default: false
    },
    distance: {
      type: String,
      default: '500px'
    },
  },
  data() {
    return {
      visible: this.render,
    }
  },
  render(h) {
    if (process.server) {
      // TODO it would be better to render the default slot
      // but nuxt re-renders on the client which creates a mismatch
      return <div>
        { this.$slots.placeholder }
      </div>
    }

    if (this.render || this.visible || !('IntersectionObserver' in window)) {
      return <div>
        { this.$slots.default }
      </div>
    }

    const callback = (visible) => {
      if (visible) {
        this.visible = true
        this.$emit('input', true)
      }
    }
    const intersection = {
      rootMargin: `${this.distance} ${this.distance} ${this.distance} ${this.distance}`,
    }

    return <div vObserveVisibility={{ callback, intersection, once: true }}>
      { this.$slots.placeholder }
    </div>
  },
})
