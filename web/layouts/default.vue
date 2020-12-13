<template>
  <div class="flex flex-col justify-between min-h-screen bg-gray-900 text-gray-200">
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
      class="bg-yellow-400 text-gray-800 py-2 text-sm text-center leading-normal hidden md:block"
    >
      <copyright></copyright>
    </footer>

    <adblock-bait></adblock-bait>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import { bootstrap } from 'vue-gtag'

export default Vue.extend({
  computed: {
    isDesktop(): boolean {
      return (<any>global).screen !== undefined && screen.width > 720
    },
    ...mapState({
      version: (state: any) => state.version as number,
      adsAllowed: (state: any) => state.adsAllowed as boolean,
      cookiesAllowed: (state: any) => state.cookiesAllowed as boolean,
      consentPopupVisible: (state: any) => state.consentPopupVisible as boolean,
      testGroup: (state: any) => state.testGroup as string,
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
      setTestGroup: 'setTestGroup',
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

      // custom A/B test flag
      if ('group' in this.$route.query) {
        console.log('overriding test group from query string')
        this.setTestGroup(this.$route.query['group'])
      } else {
        const groups = ['appnav', 'appnav-control', 'appnav-control', 'appnav-control'] as string[]
        if (!groups.includes(this.testGroup)) {
          const group = groups[Math.floor(Math.random() * groups.length)]
          this.setTestGroup(group)
          console.log('user assigned to test group', this.testGroup)
        }
      }
      this.$gtag.event('test_group_dimension', {
        'test_group': this.testGroup,
        'non_interaction': true,
      })
      console.log('user is part of test group', this.testGroup)
    },
  },
})
</script>
