import { computed, ref, useRouter } from '@nuxtjs/composition-api'
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

export const installable = computed(() => {
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

export async function install() {
  const gtag = useGtag()
  const router = useRouter()

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

const installPrompt = ref<any>()

export function setInstallPrompt(prompt: any) {
  installPrompt.value = prompt
}

export function clearInstallPrompt() {
  installPrompt.value = undefined
}
