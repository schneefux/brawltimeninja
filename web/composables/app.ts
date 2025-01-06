import { computed, onMounted, ref } from 'vue'
import { set as gtagSet, event } from 'vue-gtag'
import { useRouter } from 'vue-router'
import { useLocalePath } from './compat'
import { usePreferencesStore } from '~/stores/preferences'

const packageId = 'xyz.schneefux.brawltimeninja'

function detectApp() {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches
  const isTWA = document.referrer.startsWith('android-app')

  return {
    isApp: isPWA || isTWA,
    isPWA,
    isTWA,
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

  const installable = ref(false)
  onMounted(() => {
    const { isApp, isPWA, isTWA } = detectApp()

    if (!isApp && (installPrompt.value !== undefined || detectAndroid() || detectIOS())) {
      installable.value = true
    }

    (gtagSet as any)('user_properties', {
      'is_pwa': isPWA.toString(),
      'is_twa': isTWA.toString(),
    })
  })

  const install = async () => {
    const pwaSupported = installPrompt.value !== undefined
    if (pwaSupported) {
      installPrompt.value.prompt()
      const choice = await installPrompt.value.userChoice
      event(`prompt_install_${choice.outcome}`)
      clearInstallPrompt()
      return
    }

    if (detectAndroid()) {
      const referrer = '&referrer=utm_source%3Dwebsite%26utm_medium%3Dfallback'
      event('redirect_android_store')
      window.open(`https://play.google.com/store/apps/details?id=${packageId}${referrer}`, '_blank')
      return
    }

    if (detectIOS()) {
      event('redirect_ios_guide')
      await router.push(localePath('/install/ios'))
      return
    }
  }

  const dismissInstall = () => {
    event(`dismissed_install_${source}`)
    store.installBannerDismissed = true
    clearInstallPrompt()
  }
  const clickInstall = async () => {
    event(`clicked_install_${source}`)
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
    const installed = () => event('install')

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
  const reviewable = ref(false)

  onMounted(() => {
    const { isTWA } = detectApp()
    reviewable.value = isTWA
  })

  const dismissReview = () => {
    event('dismiss_review')
    store.reviewBannerDismissed = true
  }

  const clickReview = () => {
    event('click_review')
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
