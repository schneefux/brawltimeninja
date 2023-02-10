import { Directive } from "vue"

/*
 * see https://github.com/vuejs/core/issues/5120
 * Based on https://github.com/shimyshack/uid/blob/main/src/directives/uid.ts
 */
const uid = () => `klicker-${Date.now().toString(36).substring(6)}${Math.random().toString(36).substring(2)}`

export const Uid: Directive = {
  created(el) {
    el.setAttribute('id', el.id || uid())
  },
  getSSRProps() {
    return {
      id: uid()
    }
  },
}
