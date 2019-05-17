import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  window.onNuxtReady(() => new VuexPersistence({
    key: `brawlstars-ninja`,
    reducer: state => ({
      version: 3,
      lastPlayers: state.lastPlayers,
    }),
    restoreState: (key, storage) => {
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L189)
      let value = (storage).getItem(key)
      value = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {})

      if (value.version === undefined || value.version < 3) {
        // player schema change was messed up…
        value.lastPlayers = []
      }

      return value
    }
  }).plugin(store))
}
