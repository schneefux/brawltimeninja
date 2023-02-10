import { Directive } from "vue"

/*
 * see https://github.com/vuejs/core/issues/5120
 * Based on https://github.com/shimyshack/uid/blob/main/src/directives/uid.ts
 * and https://github.com/danielroe/vue-bind-once/blob/main/src/index.ts
 */

export const generateId = () => `klicker-${Date.now().toString(36).substring(6)}${Math.random().toString(36).substring(2)}`

export const BindOnce: Directive = {
  created(el, binding) {
    for (const key in binding.value) {
      if (!el.hasAttribute(key)) {
        el.setAttribute(key, binding.value[key])
      }
    }
  },
  getSSRProps(binding) {
    return binding.value ?? {}
  },
}
