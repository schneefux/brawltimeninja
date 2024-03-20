import { computed, onMounted, ref } from 'vue'
import { set as gtagSet, event } from 'vue-gtag'
import { useRouter } from 'vue-router'
import { useLocalePath } from './compat'
import { usePreferencesStore } from '~/stores/preferences'

const packageId = 'xyz.schneefux.brawltimeninja'

export function useIsApp() {
  const isPwa = ref<boolean>()
  const isTwa = ref<boolean>()

  onMounted(() => {
    // track some meta data
    // play store allows only 1 ad/page - TWA is detected via referrer
    isPwa.value = window.matchMedia('(display-mode: standalone)').matches
    isTwa.value = document.referrer.startsWith('android-app');

    (gtagSet as any)('user_properties', {
      'is_pwa': isPwa.toString(),
      'is_twa': isTwa.toString(),
    })
  })

  const isApp = computed(() => isPwa.value || isTwa.value)

  return {
    isPwa,
    isTwa,
    isApp,
  }
}


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
  const store = usePreferencesStore()
  const localePath = useLocalePath()
  const router = useRouter()
  const { isApp } = useIsApp()

  const installable = ref(false)
  onMounted(() => {
    if (!isApp.value && (installPrompt.value !== undefined || detectAndroid() || detectIOS())) {
      installable.value = true
    }
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
      window.open(`https://play.google.com/store/apps/details?id=${packageId}${referrer}`, '_blank')
      return
    }

    if (detectIOS()) {
      event('redirect_guide', {
        'event_category': 'app',
        'event_label': 'ios',
      })
      await router.push(localePath('/install/ios'))
      return
    }
  }

  const dismissInstall = () => {
    event('dismiss', {
      'event_category': 'app',
      'event_label': `install_${source}`,
    })
    store.installBannerDismissed = true
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

export function useReview() {
  const store = usePreferencesStore()
  const { isTwa } = useIsApp()

  const reviewable = computed(() => {
    if (import.meta.env.SSR) {
      return false
    }
    return isTwa.value
  })

  const dismissReview = () => {
    event('dismiss', {
      'event_category': 'app',
      'event_label': 'review',
    })
    store.reviewBannerDismissed = true
  }

  const clickReview = () => {
    event('click', {
      'event_category': 'app',
      'event_label': 'review',
    })
    store.reviewBannerDismissed = true
    window.location.href = 'brawltime://review'
    setTimeout(() => window.open(`https://play.google.com/store/apps/details?id=${packageId}`, '_blank'), 1000)
  }

  const reviewDismissed = computed(() => store.reviewBannerDismissed)

  return {
    reviewDismissed,
    reviewable,
    dismissReview,
    clickReview,
  }
}
