import { watch, readonly } from 'vue'
import { useLocalStorage } from '@vueuse/core'

interface StoredPlayer {
  tag: string // with hash
  name: string
}

interface TrackedPlayer extends StoredPlayer {
  deletionToken: string
}

const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

interface Preferences {
  version: number;
  lastPlayers: StoredPlayer[];
  trackedPlayers: TrackedPlayer[];
  userTag: string|undefined; // personal tag (last searched)
  personalityTestResult: string|undefined;
  installBannerDismissed: boolean;
  reviewBannerDismissed: boolean;
  youtubeBannerDismissed: boolean;
  modeSurveyBrawlersSeen: Record<string, string[]>;
}

const defaults: Preferences = {
  version: 14,
  lastPlayers: [],
  trackedPlayers: [],
  userTag: undefined,
  personalityTestResult: undefined,
  installBannerDismissed: false,
  reviewBannerDismissed: false,
  youtubeBannerDismissed: false,
  modeSurveyBrawlersSeen: {}
}

export function usePreferences() {
  const state = useLocalStorage<Preferences>('brawlstars-ninja', defaults, {
    mergeDefaults: true,
    initOnMounted: true, // hydrate with defaults, read later
  })

  watch(state, (version) => {
    if (version.version == defaults.version) return

    // v10: migration to pinia-plugin-persistedstate
    // v11: added trackedPlayers
    // v12: added modeSurveyBrawlersSeen
    // v13: added youtubeBannerDismissed
    // v14: refactor
    patchState({
      version: defaults.version,
    })
  })

  function patchState(patch: Partial<Preferences>) {
    state.value = {
      ...state.value,
      ...patch,
    }
  }

  function addLastPlayer(player: StoredPlayer) {
    const newLastPlayers = [clone(player), ...state.value.lastPlayers]
      .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
    patchState({ lastPlayers: newLastPlayers.slice(0, 4) })
  }

  function addTrackedPlayer(player: StoredPlayer, deletionToken: string) {
    const newTrackedPlayers = [{
        tag: player.tag,
        name: player.name,
        deletionToken,
      }, ...state.value.trackedPlayers]
      .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
    patchState({ trackedPlayers: newTrackedPlayers })
  }

  function removeTrackedPlayer(tag: string) {
    const newTrackedPlayers = state.value.trackedPlayers.filter(p => p.tag !== tag)
    patchState({ trackedPlayers: newTrackedPlayers })
  }

  function addBrawlersSeenInModeSurvey(mode: string, brawlerIds: string[]) {
    const responses = state.value.modeSurveyBrawlersSeen[mode] || []
    patchState({
      modeSurveyBrawlersSeen: {
        ...state.value.modeSurveyBrawlersSeen,
        [mode]: [...responses, ...brawlerIds],
      }
    })
  }

  function dismissYoutubeBanner() {
    patchState({ youtubeBannerDismissed: true })
  }

  function dismissInstallBanner() {
    patchState({
      installBannerDismissed: true,
    })
  }

  function dismissReviewBanner() {
    patchState({
      reviewBannerDismissed: true,
    })
  }

  function setPersonalityTestResult(result: string) {
    patchState({
      personalityTestResult: result,
    })
  }

  function setUserTag(tag: string) {
    patchState({
      userTag: tag,
    })
  }

  return {
    state: readonly(state),
    patchState,
    addLastPlayer,
    addTrackedPlayer,
    removeTrackedPlayer,
    addBrawlersSeenInModeSurvey,
    dismissYoutubeBanner,
    dismissInstallBanner,
    dismissReviewBanner,
    setPersonalityTestResult,
    setUserTag,
  }
}
