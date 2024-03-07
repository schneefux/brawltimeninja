type CacheValue<T> = {
  value: T,
  expirationDate: Date
}

export class Cache<K, V> {
  private cache = new Map<K, CacheValue<V>>();
  private readonly cacheMinutes: number;

  constructor(cacheMinutes: number) {
    this.cacheMinutes = cacheMinutes;
  }

  async getOrUpdate(key: K, updateFn: () => Promise<V>): Promise<V> {
    const now = new Date()
    const cacheValue = this.cache.get(key)
    if (cacheValue != undefined && cacheValue.expirationDate > now) {
      return cacheValue.value
    }

    const newValue = await updateFn()
    const expirationDate = now
    expirationDate.setMinutes(expirationDate.getMinutes() + this.cacheMinutes)
    this.cache.set(key, { value: newValue, expirationDate })

    return newValue
  }
}
