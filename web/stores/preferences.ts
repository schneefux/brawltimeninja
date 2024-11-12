import { ref, onMounted, watch } from 'vue'
import { defineStore } from 'pinia'

interface StoredPlayer {
  tag: string // with hash
  name: string
}

interface TrackedPlayer extends StoredPlayer {
  deletionToken: string
}

export const usePreferencesStore = defineStore('preferences', () => {
  const version = ref<number>()
  const lastPlayers = ref<StoredPlayer[]>([])
  const trackedPlayers = ref<TrackedPlayer[]>([])
  const userTag = ref<string>() // personal tag (last searched)
  const personalityTestResult = ref<string>()
  const installBannerDismissed = ref(false)
  const reviewBannerDismissed = ref(false)

  const state = {
    version,
    lastPlayers,
    trackedPlayers,
    userTag,
    personalityTestResult,
    installBannerDismissed,
    reviewBannerDismissed,
  }

  const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

  function addLastPlayer(player: StoredPlayer) {
    const newLastPlayers = [clone(player), ...lastPlayers.value]
      .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
    lastPlayers.value = newLastPlayers.slice(0, 4)
  }

  function addTrackedPlayer(player: StoredPlayer, deletionToken: string) {
    const newTrackedPlayers = [{
        tag: player.tag,
        name: player.name,
        deletionToken,
      }, ...trackedPlayers.value]
      .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
    trackedPlayers.value = newTrackedPlayers
  }

  function removeTrackedPlayer(tag: string) {
    trackedPlayers.value = trackedPlayers.value.filter(p => p.tag !== tag)
  }

  // sync with localstorage
  onMounted(() => {
    const data = JSON.parse(localStorage.getItem('brawlstars-ninja') || '{}')
    for (const key in state) {
      if (key in data) {
        state[key as keyof typeof state].value = data[key]
      }
    }
    // v10: migration to pinia-plugin-persistedstate
    // v11: added trackedPlayers
    version.value = 11
  })

  watch([...Object.values(state)], () => {
    if (state.version.value == undefined) {
      // load first
      return
    }

    const data: any = {}
    for (const key in state) {
      data[key] = state[key as keyof typeof state].value
    }
    localStorage.setItem('brawlstars-ninja', JSON.stringify(data))
  })


  return {
    ...state,
    addLastPlayer,
    addTrackedPlayer,
    removeTrackedPlayer,
  }
})

