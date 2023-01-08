import Vue, { PropType } from 'vue'

// based on https://github.com/vuejs/vue-router/blob/dev/src/components/link.js
function guardEvent(e: any) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute('target')
    if (/\b_blank\b/i.test(target)) return
  }
  e.preventDefault()
  return true
}

/**
 * Minimal, functional router-link without styling or prefetching.
 *
 * Performance test, patching 4 links
 *  * router-link: 12ms
 *  * router-link: 8ms
 *  * fast-link: 4ms
 */
export default Vue.extend({
  functional: true,
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    router: {
      type: Object as PropType<any>,
      required: true
    },
  },
  render(h, { props, slots, data }) {
    const router = props.router
    const current = router.currentRoute
    const { location, href } = router.resolve(
      props.to,
      current,
      false
    )

    const d = {
      ...data,
      on: {
        click: (e: any) => {
          if (guardEvent(e)) {
            router.push(location, () => {})
          }
        },
      },
      attrs: { href },
    }

    return h('a', d, slots().default)
  },
})
