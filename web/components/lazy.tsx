import Vue from 'vue'

export default Vue.extend({
  name: 'Lazy',
  props: {
    render: {
      // manual override
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      visible: this.render || global.window == undefined || !('IntersectionObserver' in window),
    }
  },
  render(h) {
    if (this.render || this.visible) {
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
      rootMargin: '500px 500px 500px 500px',
    }

    // TODO skip when SSR
    return <div vObserveVisibility={{ callback, intersection, once: true }}>
      { this.$slots.placeholder }
    </div>
  },
})
