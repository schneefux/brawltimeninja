<template>
  <div
    ref="container"
    class="flex flex-col justify-between min-h-screen bg-background text-text"
  >
    <web-nav class="hidden lg:flex"></web-nav>
    <app-head-nav class="lg:hidden"></app-head-nav>

    <ad
      :ad-region="$route != undefined ? $route.fullPath : undefined"
      ad-slot="6848221017"
      class="fixed left-4 inset-y-0 flex flex-col justify-center"
      scraper
    ></ad>
    <ad
      :ad-region="$route != undefined ? $route.fullPath : undefined"
      ad-slot="8127026559"
      class="fixed right-4 inset-y-0 flex flex-col justify-center"
      scraper
    ></ad>

    <nuxt />

    <install-prompt-capture></install-prompt-capture>
    <b-cookie-consent
      v-if="consentPopupVisible"
      @enable-none="disableCookies"
      @enable-cookies="enableCookies"
      @enable-all="enableCookiesAndAds"
    >
      <nuxt-link
        slot="link"
        class="underline"
        to="/about"
      >link</nuxt-link>
    </b-cookie-consent>

    <app-bottom-nav class="lg:hidden"></app-bottom-nav>
    <b-web-footer
      :links="links"
      tag="nuxt-link"
      class="hidden lg:block"
    >
      <copyright
        slot="below"
        class="mt-4 text-sm"
      ></copyright>
    </b-web-footer>

    <adblock-bait></adblock-bait>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useContext, useMeta, useStore, watch, wrapProperty, ref, onMounted, useRoute } from '@nuxtjs/composition-api'
import { useMutationObserver } from '@vueuse/core'
import { BWebFooter, BCookieConsent } from '@schneefux/klicker/components'
import { setIsPwa, setIsTwa } from '~/composables/app'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  components: {
    BWebFooter,
    BCookieConsent,
  },
  head: {},
  setup(props, { root }) {
    const container = ref<HTMLElement>()

    const { localePath, i18n } = useContext()

    useMeta(() => {
      // https://i18n.nuxtjs.org/seo/#improving-performance
      // will also add rel=canonical without query params
      return root.$nuxtI18nHead({ addSeoAttributes: true, addDirAttribute: true })
    })

    const links = computed(() => [ {
      name: i18n.t('nav.Leaderboards'),
      target: localePath('/leaderboard/hours'),
    }, {
      name: i18n.t('nav.Guides'),
      target: '/blog/guides',
    }, {
      name: i18n.t('nav.Status'),
      target: localePath('/status'),
    }, {
      name: i18n.t('nav.Privacy'),
      target: '/about',
    }])

    const store = useStore<any>()
    const version = computed(() => store.state.version as number)
    const adsAllowed = computed(() => store.state.adsAllowed as undefined|boolean)
    const cookiesAllowed = computed(() => store.state.cookiesAllowed as undefined|boolean)
    const consentPopupVisible = computed(() => store.state.consentPopupVisible as boolean)

    const disableCookies = () => {
      store.commit('hideConsentPopup')
      store.commit('setCookiesAllowed', false)
      store.commit('setAdsAllowed', false)
      hideAds()
    }
    const enableCookies = () => {
      store.commit('hideConsentPopup')
      store.commit('setCookiesAllowed', true)
      store.commit('setAdsAllowed', false)
      hideAds()
    }
    const enableCookiesAndAds = () => {
      store.commit('hideConsentPopup')
      store.commit('setCookiesAllowed', true)
      store.commit('setAdsAllowed', true)
      enableAds()
    }

    const gtag = useGtag()
    const enableAds = () => {
      if (adsAllowed.value && process.client) {
        // update consent preferences
        if ('adsbygoogle' in window) {
          (<any>window).adsbygoogle.pauseAdRequests = 0
        }
        gtag.optIn()

        // track some meta data
        // play store allows only 1 ad/page - TWA is detected via referrer
        const isPwa = window.matchMedia('(display-mode: standalone)').matches
        const isTwa = document.referrer.startsWith('android-app')

        setIsPwa(isPwa)
        setIsTwa(isTwa)

        gtag.event('branch_dimension', {
          'branch': process.env.branch || '',
          'non_interaction': true,
        })
        gtag.event('is_pwa_dimension', {
          'is_pwa': isPwa,
          'non_interaction': true,
        })
        gtag.event('is_twa_dimension', {
          'is_twa': isTwa,
          'non_interaction': true,
        })
      }
    }
    const hideAds = () => {
      if (process.client) {
        (<any>window).adsbygoogle.pauseAdRequests = 1
        const sheet = document.createElement('style')
        sheet.type = 'text/css'
        sheet.innerText = '.adswrapper { display: none; }'
        document.head.appendChild(sheet)
      }
    }

    // called after vuex-persist has loaded
    watch(version, () => {
      if (cookiesAllowed.value == undefined || cookiesAllowed.value == false) {
        store.commit('showConsentPopup')
      } else {
        if (adsAllowed.value) {
          enableAds()
        } else {
          hideAds()
        }
      }
    })

    // TODO the fix for https://github.com/vueuse/vueuse/issues/685
    // and/or importing vueuse as peer dependency breaks this ref type
    useMutationObserver(container as any, () => {
      // workaround for AdSense overriding min-height: 0px
      // https://weblog.west-wind.com/posts/2020/May/25/Fixing-Adsense-Injecting-height-auto-important-into-scrolled-Containers
      // wtf Google
      container.value!.style['min-height'] = ''
    }, {
      attributes: true,
      attributeFilter: ['style'],
    })

    const route = useRoute()
    onMounted(() => {
      if ('light' in route.value.query) {
        document.getElementById('__nuxt')!.classList.add('light')
      }
    })

    return {
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
