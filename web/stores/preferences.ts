import { ref, computed, onMounted, watch } from 'vue'
import { defineStore } from 'pinia'

interface StoredPlayer {
  tag: string
  name: string
}

export const usePreferencesStore = defineStore('preferences', () => {
  const version = ref<number>()
  const lastPlayers = ref<StoredPlayer[]>([])
  const userTag = ref<string>() // personal tag (last searched)
  const personalityTestResult = ref<string>()
  const installBannerDismissed = ref(false)
  const reviewBannerDismissed = ref(false)

  const state = {
    version,
    lastPlayers,
    userTag,
    personalityTestResult,
    installBannerDismissed,
    reviewBannerDismissed,
  }

  function addLastPlayer(player: StoredPlayer) {
    const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

    const newLastPlayers = [clone(player), ...lastPlayers.value]
      .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
    lastPlayers.value = newLastPlayers.slice(0, 4)
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
    version.value = 10
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
  }
})

