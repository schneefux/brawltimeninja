import { WeakLRUCache } from 'weak-lru-cache'

export default class WeakLRUCacheMaplike<K, V> extends Map<K, V> {
  // wrap value in object so they can be stored in weakmap
  private cache = new WeakLRUCache<K, { value: V }>({
    // the average response is a bit less than 1kb so this will reserve about 32MB
    // and keep the rest to the garbage collector
    cacheSize: 32768,
  })

  get(key: K) {
    return this.cache.getValue(key)?.value
  }
  set(key: K, value: V) {
    this.cache.setValue(key, { value })
    return this
  }
  has(key: K) {
    return this.cache.has(key)
  }
  delete(key: K) {
    return this.cache.delete(key)
  }
  clear() {
    this.cache.clear()
  }
  get size() {
    return this.cache.size
  }
}
