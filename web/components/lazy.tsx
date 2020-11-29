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
    translucent: {
      type: Boolean
    },
  },
  data() {
    return {
      visible: this.render,
    }
  },
  render(h) {
    if (this.render || this.visible) {
      return <div class={{ 'contents': this.translucent }}>
        { this.$slots.default }
      </div>
    }

    if (process.server) {
      // TODO it would be better to render the default slot
      // but nuxt re-renders on the client which creates a mismatch
      return <div>
        { this.$slots.placeholder }
      </div>
    }

    if (!('IntersectionObserver' in window)) {
      return <div class={{ 'contents': this.translucent }}>
        { this.$slots.default }
      </div>
    }

    const callback = (visible) => {
      if (visible) {
        this.visible = true
        this.$emit('visible', true)
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
