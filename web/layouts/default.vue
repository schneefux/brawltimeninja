<template>
  <div
    ref="container"
    class="flex flex-col justify-between min-h-screen bg-background text-text"
  >
    <web-nav class="hidden lg:flex"></web-nav>
    <app-head-nav class="lg:hidden"></app-head-nav>

    <ad
      :ad-region="$route.fullPath"
      ad-slot="6848221017"
      class="fixed left-4 inset-y-0 flex flex-col justify-center"
      scraper
    ></ad>
    <ad
      :ad-region="$route.fullPath"
      ad-slot="8127026559"
      class="fixed right-4 inset-y-0 flex flex-col justify-center"
      scraper
    ></ad>

    <nuxt />

    <install-prompt-capture></install-prompt-capture>
    <cookie-consent-popup
      v-if="consentPopupVisible"
      @enable-none="disableCookies"
      @enable-cookies="enableCookies"
      @enable-all="enableCookiesAndAds"
    ></cookie-consent-popup>

    <app-bottom-nav class="lg:hidden"></app-bottom-nav>
    <footer class="bg-yellow-400 text-gray-800 py-4 text-center leading-normal hidden lg:block">
      <div class="space-x-4 mt-2">
        <nuxt-link
          v-for="link in links"
          :key="link.target"
          :to="link.target"
          class="inline-block lg:border-0 hover:text-gray-800/75"
          exact-active-class="text-red-800"
        >
          {{ $t('nav.' + link.name) }}
        </nuxt-link>
      </div>
      <copyright class="mt-4 text-sm"></copyright>
    </footer>

    <adblock-bait></adblock-bait>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useContext, useMeta, useStore, watch, wrapProperty, ref, onMounted, useRoute } from '@nuxtjs/composition-api'
import { useMutationObserver } from '@vueuse/core'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  head: {},
  setup(props, { root }) {
    const container = ref<HTMLElement>()

    const { localePath } = useContext()

    useMeta(() => {
      // https://i18n.nuxtjs.org/seo/#improving-performance
      // will also add rel=canonical without query params
      return root.$nuxtI18nHead({ addSeoAttributes: true, addDirAttribute: true })
    })

    const links = [ {
      name: 'Leaderboards',
      target: localePath('/leaderboard/hours'),
    }, {
      name: 'Guides',
      target: '/blog/guides',
    }, {
      name: 'Status',
      target: localePath('/status'),
    }, {
      name: 'Guides',
      target: '/blog/guides',
    }, {
      name: 'Privacy',
      target: '/about',
    }]

    const store = useStore<any>()
    const version = computed(() => store.state.version as number)
    const adsAllowed = computed(() => store.state.adsAllowed as boolean)
    const cookiesAllowed = computed(() => store.state.cookiesAllowed as boolean)
    const consentPopupVisible = computed(() => store.state.consentPopupVisible as boolean)

    const disableCookies = () => {
      store.commit('hideConsentPopup')
      store.commit('disallowCookies')
      store.commit('disallowAds')
      clearAdsCookie()
      clearCookieCookie()
      hideAds()
    }
    const enableCookies = () => {
      store.commit('hideConsentPopup')
      store.commit('allowCookies')
      store.commit('disallowAds')
      clearAdsCookie()
      setCookieCookie()
      hideAds()
    }
    const enableCookiesAndAds = () => {
      store.commit('hideConsentPopup')
      store.commit('allowCookies')
      store.commit('allowAds')
      setAdsCookie()
      setCookieCookie()
      enableAds()
    }

    const setCookieCookie = () => {
      document.cookie = `cookies=true; path=/; expires=${new Date(Date.now() + 365*24*60*60*1000)}`
    }
    const clearCookieCookie = () => {
      document.cookie = `cookies=; path=/; expires=${new Date(0)}`
    }
    const setAdsCookie = () => {
      document.cookie = `ads=true; path=/; expires=${new Date(Date.now() + 365*24*60*60*1000)}`
    }
    const clearAdsCookie = () => {
      document.cookie = `ads=; path=/; expires=${new Date(0)}`
    }

    const gtag = useGtag()
    const enableAds = () => {
      if (adsAllowed.value && (<any>process).client) {
        // update consent preferences
        if ('adsbygoogle' in window) {
          (<any>window).adsbygoogle.pauseAdRequests = 0
        }
        gtag.optIn()

        // track some meta data
        // play store allows only 1 ad/page - TWA is detected via referrer
        const isPwa = window.matchMedia('(display-mode: standalone)').matches
        const isTwa = document.referrer.startsWith('android-app')

        if (isPwa || isTwa) {
          store.commit('setIsApp')
        }

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
      if ((<any>process).client) {
        (<any>window).adsbygoogle.pauseAdRequests = 1
        const sheet = document.createElement('style')
        sheet.type = 'text/css'
        sheet.innerText = '.adswrapper { display: none; }'
        document.head.appendChild(sheet)
      }
    }

    // called after vuex-persist has loaded
    watch(version, () => {
      if (!cookiesAllowed.value) {
        store.commit('showConsentPopup')
      } else {
        // 'unpack-store' middleware sets cookiesAllowed and adsAllowed
        // based on cookies
        // 2020-12-06: Disabled because caching the HTML with the `cached`
        // middleware will serve random settings to users
        setCookieCookie() // refresh
        if (adsAllowed.value) {
          enableAds()
          setAdsCookie() // refresh
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
