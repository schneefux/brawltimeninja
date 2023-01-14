<template>
  <div
    ref="container"
    class="flex flex-col justify-between min-h-screen bg-background text-text"
  >
    <web-nav class="hidden lg:flex"></web-nav>
    <app-head-nav class="lg:hidden"></app-head-nav>

    <ad
      :ad-region="route.fullPath"
      ad-slot="6848221017"
      class="fixed left-4 inset-y-0 flex flex-col justify-center"
      scraper
    ></ad>
    <ad
      :ad-region="route.fullPath"
      ad-slot="8127026559"
      class="fixed right-4 inset-y-0 flex flex-col justify-center"
      scraper
    ></ad>

    <slot></slot>

    <b-cookie-consent
      v-if="consentPopupVisible"
      @enable-none="disableCookies"
      @enable-cookies="enableCookies"
      @enable-all="enableCookiesAndAds"
    >
      <template v-slot:link>
        <router-link
          class="underline"
          to="/about"
        >link</router-link>
      </template>
    </b-cookie-consent>

    <app-bottom-nav class="lg:hidden"></app-bottom-nav>
    <b-web-footer
      :links="links"
      tag="router-link"
      class="hidden lg:block"
    >
      <template v-slot:below>
        <copyright
          class="mt-4 text-sm"
        ></copyright>
      </template>
    </b-web-footer>

    <adblock-bait></adblock-bait>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, watch, ref, onMounted } from 'vue'
import { useMutationObserver } from '@vueuse/core'
import { BWebFooter, BCookieConsent } from '@schneefux/klicker/components'
import { setIsPwa, setIsTwa, useInstallPromptListeners } from '~/composables/app'
import { useBrawlstarsNinjaStore } from '~/stores/brawlstars-ninja'
import { event, optIn, pageview } from 'vue-gtag'
import { useI18n } from 'vue-i18n'
import { useRoute, useLocaleCookieRedirect } from '@/composables/compat'

export default defineComponent({
  components: {
    BWebFooter,
    BCookieConsent,
  },
  head: {},
  setup() {
    const container = ref<HTMLElement>()

    const i18n = useI18n()

    const links = computed(() => [ {
      name: i18n.t('nav.Leaderboards'),
      target: '/leaderboard/hours',
    }, {
      name: i18n.t('nav.Guides'),
      target: '/blog/guides',
    }, {
      name: i18n.t('nav.Status'),
      target: '/status',
    }, {
      name: i18n.t('nav.Privacy'),
      target: '/about',
    }])

    const store = useBrawlstarsNinjaStore()
    const version = computed(() => store.version)
    const adsAllowed = computed(() => store.adsAllowed)
    const cookiesAllowed = computed(() => store.cookiesAllowed)
    const consentPopupVisible = computed(() => store.consentPopupVisible)

    const disableCookies = () => {
      store.hideConsentPopup()
      store.setCookiesAllowed(false)
      store.setAdsAllowed(false)
      hideAds()
    }
    const enableCookies = () => {
      store.hideConsentPopup()
      store.setCookiesAllowed(true)
      store.setAdsAllowed(false)
      hideAds()
    }
    const enableCookiesAndAds = () => {
      store.hideConsentPopup()
      store.setCookiesAllowed(true)
      store.setAdsAllowed(true)
      enableAds()
    }

    const enableAds = async () => {
      if (adsAllowed.value && !import.meta.env.SSR) {
        // update consent preferences
        if ('adsbygoogle' in window) {
          (<any>window).adsbygoogle.pauseAdRequests = 0
        }
        optIn()

        // track some meta data
        // play store allows only 1 ad/page - TWA is detected via referrer
        const isPwa = window.matchMedia('(display-mode: standalone)').matches
        const isTwa = document.referrer.startsWith('android-app')

        setIsPwa(isPwa)
        setIsTwa(isTwa)

        event('branch_dimension', {
          'branch': import.meta.env.VITE_BRANCH || '',
          'non_interaction': true,
        })
        event('is_pwa_dimension', {
          'is_pwa': isPwa,
          'non_interaction': true,
        })
        event('is_twa_dimension', {
          'is_twa': isTwa,
          'non_interaction': true,
        })
      }
    }
    const hideAds = () => {
      if (!import.meta.env.SSR) {
        (<any>window).adsbygoogle.pauseAdRequests = 1
        const sheet = document.createElement('style')
        sheet.type = 'text/css'
        sheet.innerText = '.adswrapper { display: none; }'
        document.head.appendChild(sheet)
      }
    }

    onMounted(() => {
      if (cookiesAllowed.value == undefined || cookiesAllowed.value == false) {
        store.showConsentPopup()
      } else {
        if (adsAllowed.value) {
          enableAds()
        } else {
          hideAds()
        }
      }
    })

    const route = useRoute()
    watch(route, (to, from) => {
      if (to.path != from?.path) {
        pageview({ page_path: to.path })
      }
    }, { immediate: true })

    useMutationObserver(container, () => {
      // workaround for AdSense overriding min-height: 0px
      // https://weblog.west-wind.com/posts/2020/May/25/Fixing-Adsense-Injecting-height-auto-important-into-scrolled-Containers
      // wtf Google
      container.value!.style['min-height'] = ''
    }, {
      attributes: true,
      attributeFilter: ['style'],
    })

    useInstallPromptListeners()
    useLocaleCookieRedirect()

    return {
      route,
      links,
      disableCookies,
      enableCookies,
      enableCookiesAndAds,
      consentPopupVisible,
      container,
    }
  },
})
</script>
