import { computed, ref } from 'vue'
import { event } from 'vue-gtag'
import { useBrawlstarsNinjaStore } from '~/stores/brawlstars-ninja'
import { useRouter } from './compat'

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
  const store = useBrawlstarsNinjaStore()

  const installable = computed(() => {
    if (isApp.value) {
      return false
    }
    if (import.meta.env.SSR) {
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
      event('prompt', {
        'event_category': 'app',
        'event_label': choice.outcome,
      })
      clearInstallPrompt()
      return
    }

    if (detectAndroid()) {
      const referrer = '&referrer=utm_source%3Dwebsite%26utm_medium%3Dfallback'
      event('redirect_store', {
        'event_category': 'app',
        'event_label': 'fallback',
      })
      window.open('https://play.google.com/store/apps/details?id=xyz.schneefux.brawltimeninja' + referrer, '_blank')
      return
    }

    if (detectIOS()) {
      const router = useRouter()
      event('redirect_guide', {
        'event_category': 'app',
        'event_label': 'ios',
      })
      router.push('/install/ios')
      return
    }
  }

  const dismissInstall = () => {
    event('dismiss', {
      'event_category': 'app',
      'event_label': `install_${source}`,
    })
    store.dismissInstallBanner()
    clearInstallPrompt()
  }
  const clickInstall = async () => {
    event('click', {
      'event_category': 'app',
      'event_label': `install_${source}`,
    })
    await install()
  }

  const installDismissed = computed(() => store.installBannerDismissed)

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

export function useInstallPromptListeners() {
  if (!import.meta.env.SSR) {
    const installed = () => event('install', {
      'event_category': 'app',
      'event_label': 'install',
    })

    window.addEventListener('appinstalled', installed)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    })
  }
}

export function clearInstallPrompt() {
  installPrompt.value = undefined
}
