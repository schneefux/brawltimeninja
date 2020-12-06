import Vue from 'vue'

// https://github.com/markhalliwell/vue-wrapped-component
export default Vue.extend({
  functional: true,
  name: 'WrappedComponent',
  props: {
    tag: {
      default: 'div',
      type: String,
    },
    wrap: {
      default: false,
      type: Boolean,
    },
    wrapRoot: {
      default: false,
      type: Boolean,
    },
  },
  render(h, ctx) {
    const { data, parent, props } = ctx
    const warn = (parent.$options as any)._base.util.warn

    // Retrieve slots, creating new objects so they're not immutable (frozen).
    const slots = {...ctx.slots()}
    Object.keys(slots).forEach((k) => slots[k] = [...slots[k]])

    const addChildren = (vNode, children) => {
      const _addChildren = (obj) => {
        obj.children = [].concat(obj.children || [], children || [])
        if (!obj.children.length) {
          obj.children = undefined
        }
      }
      // Add children to component options, if there are any, otherwise vNode.
      _addChildren(vNode.componentOptions || vNode)
      return vNode
    }

    // Check for scoped slots on components in the default scope if there
    // isn't a dedicated named slot for wrapper.
    if (!slots.wrapper) {
      const wrappers: any[] = []
      slots.default.forEach((vNode, i) => {
        if (vNode.data && vNode.data.scopedSlots && vNode.data.scopedSlots.wrapper) {
          slots.default.splice(i, 1)
          const children = vNode.data.scopedSlots.wrapper()
          delete vNode.data.scopedSlots
          wrappers.push(addChildren(vNode, children))
        }
      })
      if (wrappers.length) {
        slots.wrapper = wrappers
      }
    }

    if (!slots.wrapper) {
      return warn('You must provide a template slot named "wrapper" for this component to function as intended (e.g. <template v-slot="wrapper">).')
    }
    if (!slots.wrapper.length) {
      return warn('You must provide a at least one root component/element inside the wrapper template for this component to function as intended.')
    }

    // Handle non-wrapped state.
    if (!props.wrap) {
      // If there's only a single default slot, return it.
      if (!props.wrapRoot && slots.default.length === 1) {
        return slots.default
      }

      return h(props.tag, data, slots.default)
    }

    // Handle wrapped state.
    const wrapper = addChildren(slots.wrapper.shift(), slots.default)

    // If there's only a single wrapper slot, return it.
    if (!props.wrapRoot && !slots.wrapper.length) {
      return wrapper
    }

    return h(props.tag, data, [wrapper, ...slots.wrapper])
  }
})
