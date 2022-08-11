import { computed, ref, useRouter, useStore } from '@nuxtjs/composition-api'
import { useGtag } from './gtag'

const isPwa = ref<boolean>()
const isTwa = ref<boolean>()

export function setIsPwa(is: boolean) {
  isPwa.value = is
}

export function setIsTwa(is: boolean) {
  isTwa.value = is
}

export const isApp = computed(() => isPwa.value || isTwa.value)

function detectAndroid() {
  return /android/i.test(navigator.userAgent)
}

function detectIOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
}

export function useInstall(source: string) {
  const gtag = useGtag()
  const router = useRouter()
  const store = useStore<any>()

  const installable = computed(() => {
    if (isApp.value) {
      return false
    }
    if (!process.client) {
      return false
    }
    if (installPrompt.value !== undefined) {
      return true
    }
    return detectAndroid() || detectIOS()
  })

  const install = async () => {
    const pwaSupported = installPrompt.value !== undefined
    if (pwaSupported) {
      installPrompt.value.prompt()
      const choice = await installPrompt.value.userChoice
      gtag.event('prompt', {
        'event_category': 'app',
        'event_label': choice.outcome,
      })
      clearInstallPrompt()
      return
    }

    if (detectAndroid()) {
      const referrer = '&referrer=utm_source%3Dwebsite%26utm_medium%3Dfallback'
      gtag.event('redirect_store', {
        'event_category': 'app',
        'event_label': 'fallback',
      })
      window.open('https://play.google.com/store/apps/details?id=xyz.schneefux.brawltimeninja' + referrer, '_blank')
      return
    }

    if (detectIOS()) {
      gtag.event('redirect_guide', {
        'event_category': 'app',
        'event_label': 'ios',
      })
      router.push('/install/ios')
      return
    }
  }

  const dismissInstall = () => {
    gtag.event('dismiss', {
      'event_category': 'app',
      'event_label': `install_${source}`,
    })
    store.commit('dismissInstallBanner')
    clearInstallPrompt()
  }
  const clickInstall = async () => {
    gtag.event('click', {
      'event_category': 'app',
      'event_label': `install_${source}`,
    })
    await install()
  }

  const installDismissed = computed(() => store.state.installBannerDismissed)

  return {
    install,
    installDismissed,
    installable,
    dismissInstall,
    clickInstall,
  }
}

const installPrompt = ref<any>()

export function setInstallPrompt(prompt: any) {
  installPrompt.value = prompt
}

export function clearInstallPrompt() {
  installPrompt.value = undefined
}
