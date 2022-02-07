<template>
  <div class="dark">
    <div class="flex flex-col justify-between min-h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <web-nav class="hidden md:flex"></web-nav>
      <app-head-nav class="md:hidden"></app-head-nav>

      <nuxt />

      <install-prompt-capture></install-prompt-capture>
      <cookie-consent-popup
        v-if="consentPopupVisible"
        @enable-none="disableCookies"
        @enable-cookies="enableCookies"
        @enable-all="enableCookiesAndAds"
      ></cookie-consent-popup>

      <app-bottom-nav class="md:hidden"></app-bottom-nav>
      <footer
        class="bg-yellow-400 text-gray-800 py-4 text-center leading-normal hidden md:block"
      >
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState, mapMutations } from 'vuex'

export default Vue.extend({
  head(): MetaInfo {
    // https://i18n.nuxtjs.org/seo/#improving-performance
    // will also add rel=canonical without query params
    return this.$nuxtI18nHead({ addSeoAttributes: true, addDirAttribute: true })
  },
  computed: {
    links(): { name: string, target: string }[] {
      return [ {
        name: 'Leaderboards',
        target: this.localePath('/leaderboard/hours'),
      }, {
        name: 'Guides',
        target: '/blog/guides',
      }, {
        name: 'Status',
        target: this.localePath('/status'),
      }, {
        name: 'Privacy',
        target: '/about',
      }]
    },
    ...mapState({
      version: (state: any) => state.version as number,
      adsAllowed: (state: any) => state.adsAllowed as boolean,
      cookiesAllowed: (state: any) => state.cookiesAllowed as boolean,
      consentPopupVisible: (state: any) => state.consentPopupVisible as boolean,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  methods: {
    disableCookies() {
      this.hideConsentPopup()
      this.disallowCookies()
      this.disallowAds()
      this.clearAdsCookie()
      this.clearCookieCookie()
      this.hideAds()
    },
    enableCookies() {
      this.hideConsentPopup()
      this.allowCookies()
      this.disallowAds()
      this.clearAdsCookie()
      this.setCookieCookie()
      this.hideAds()
    },
    enableCookiesAndAds() {
      this.hideConsentPopup()
      this.allowCookies()
      this.allowAds()
      this.setAdsCookie()
      this.setCookieCookie()
      this.enableAds()
    },
    setCookieCookie() {
      document.cookie = `cookies=true; expires=${new Date(Date.now() + 365*24*60*60*1000)}`
    },
    clearCookieCookie() {
      document.cookie = `cookies=; expires=${new Date(0)}`
    },
    setAdsCookie() {
      document.cookie = `ads=true; expires=${new Date(Date.now() + 365*24*60*60*1000)}`
    },
    clearAdsCookie() {
      document.cookie = `ads=; expires=${new Date(0)}`
    },
    enableAds() {
      if (this.adsAllowed && (<any>process).client) {
        // update consent preferences
        if ('adsbygoogle' in window) {
          (<any>window).adsbygoogle.pauseAdRequests = 0
        }
        this.$gtag.optIn()

        // track some meta data
        // play store allows only 1 ad/page - TWA is detected via referrer
        const isPwa = window.matchMedia('(display-mode: standalone)').matches
        const isTwa = document.referrer.startsWith('android-app')

        if (isPwa || isTwa) {
          this.setIsApp()
        }

        this.$gtag.event('branch_dimension', {
          'branch': process.env.branch || '',
          'non_interaction': true,
        })
        this.$gtag.event('is_pwa_dimension', {
          'is_pwa': isPwa,
          'non_interaction': true,
        })
        this.$gtag.event('is_twa_dimension', {
          'is_twa': isTwa,
          'non_interaction': true,
        })
      }
    },
    hideAds() {
      if ((<any>process).client) {
        (<any>window).adsbygoogle.pauseAdRequests = 1
        const sheet = document.createElement('style')
        sheet.type = 'text/css'
        sheet.innerText = '.adswrapper { display: none; }'
        document.head.appendChild(sheet)
      }
    },
    ...mapMutations({
      allowCookies: 'allowCookies',
      disallowCookies: 'disallowCookies',
      allowAds: 'allowAds',
      disallowAds: 'disallowAds',
      hideConsentPopup: 'hideConsentPopup',
      showConsentPopup: 'showConsentPopup',
      setIsApp: 'setIsApp',
    }),
  },
  watch: {
    // called after vuex-persist has loaded
    version() {
      if (!this.cookiesAllowed) {
        this.showConsentPopup()
      } else {
        // 'unpack-store' middleware sets cookiesAllowed and adsAllowed
        // based on cookies
        // 2020-12-06: Disabled because caching the HTML with the `cached`
        // middleware will serve random settings to users
        this.setCookieCookie() // refresh
        if (this.adsAllowed) {
          this.enableAds()
          this.setAdsCookie() // refresh
        } else {
          this.hideAds()
        }
      }
    },
  },
})
</script>
