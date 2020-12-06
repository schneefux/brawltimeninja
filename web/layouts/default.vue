<template>
  <div
    class="flex flex-col justify-between min-h-screen bg-primary text-grey-lighter bg-center bg-top-y"
    :style="`background-image: radial-gradient(circle closest-side, rgba(0, 0, 32, 0.6), rgba(0, 0, 0, 0.5)), url('${background}')`"
  >
    <web-nav
      :class="{
        'hidden md:flex': testGroup == 'appnav',
      }"
    ></web-nav>
    <app-head-nav
      v-show="testGroup == 'appnav'"
      class="md:hidden"
    ></app-head-nav>

    <nuxt />

    <install-prompt-capture></install-prompt-capture>
    <cookie-consent-popup
      v-if="consentPopupVisible"
      @enable-none="disableCookies"
      @enable-cookies="enableCookies"
      @enable-all="enableCookiesAndAds"
    ></cookie-consent-popup>

    <app-bottom-nav
      v-show="testGroup == 'appnav'"
      class="md:hidden"
    ></app-bottom-nav>

    <footer
      :class="['bg-primary-darker py-2 text-sm text-center leading-normal', {
        'hidden md:block': testGroup == 'appnav',
      }]"
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
    background(): string {
      return this.isDesktop
        ? require('~/assets/images/background/blue_desktop.jpg')
        : require('~/assets/images/background/blue_mobile.jpg')
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
  created() {
    // 'unpack-store' middleware sets cookiesAllowed and adsAllowed
    // based on cookies
    // 2020-12-06: Disabled because caching the HTML with the `cached`
    // middleware will serve random settings to users
    if (process.client) {
      if (this.cookiesAllowed) {
        this.setCookieCookie() // refresh
      }
      if (this.adsAllowed) {
        this.enableAds()
        this.setAdsCookie() // refresh
      }
      if (!this.adsAllowed && !this.consentPopupVisible) {
        this.hideAds()
      }
    }
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

        // set variables for split testing
        this.$gtag.customMap({
          'dimension1': process.env.branch || '',
          'dimension3': isPwa.toString(),
          'dimension4': isTwa.toString(),
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
      setIsApp: 'setIsApp',
      setTestGroup: 'setTestGroup',
    }),
  },
  watch: {
    // called after vuex-persist has loaded
    version() {
      // custom A/B test flag
      if ('group' in this.$route.query) {
        console.log('overriding test group from query string')
        this.setTestGroup(this.$route.query['group'])
      } else {
      /*
        const groups = ['appnav', 'appnav-control', 'appnav-control', 'appnav-control'] as string[]
        if (!groups.includes(this.testGroup)) {
          const group = groups[Math.floor(Math.random() * groups.length)]
          this.setTestGroup(group)
          console.log('user assigned to test group', this.testGroup)
        }
      */
      }
      this.$gtag.customMap({
        'dimension5': this.testGroup,
      })
      console.log('user is part of test group', this.testGroup)
    },
  },
})
</script>

<style lang="postcss">
.bg-top-y {
  background-position-y: top;
}
</style>
