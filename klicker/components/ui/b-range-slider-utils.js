// Unsharp text [#166](https://github.com/NightCatSama/vue-slider-component/issues/166)
export const roundToDPR = value => Math.round(value * (window.devicePixelRatio || 1)) / r

export function isArray(input) {
  if (Array.prototype.isArray) {
    return Array.isArray(input)
  }
  return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]'
}

export function isDiff(a, b) {
  if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
    return true
  } else if (isArray(a) && a.length === b.length) {
    return a.some((v, i) => v !== b[i])
  }
  return a !== b
}

export function addEvent(el, type, fn, capture) {
  el.addEventListener(type, fn, {passive: false, capture: !!capture})
}

export function removeEvent(el, type, fn, capture) {
  el.removeEventListener(type, fn, {passive: false, capture: !!capture})
}
