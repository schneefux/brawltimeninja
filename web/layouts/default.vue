<template>
  <div
    class="flex flex-col justify-between min-h-screen bg-primary text-grey-lighter bg-center bg-top-y"
    :style="`background-image: radial-gradient(circle closest-side, rgba(0, 0, 32, 0.6), rgba(0, 0, 0, 0.5)), url('${background}')`"
  >
    <nav class="bg-primary-dark px-4 pb-2 lg:p-6 flex justify-between items-center flex-wrap sticky z-40 top-0 lg:static">
      <div class="flex-shrink-0 bg-primary-dark z-40 pt-3 pb-1 lg:py-0 w-full lg:w-auto">
        <nuxt-link
          to="/"
          class="font-semibold text-xl text-white tracking-tighter"
        >
          Brawl Time Ninja
        </nuxt-link>
        <div class="lg:hidden float-right">
          <button
            v-show="isInstallable"
            class="px-2 py-1 border rounded border-primary-light text-primary-lightest"
            @click="clickInstall"
          >
            <span class="mr-1">📥</span>
            Install
          </button>
          <button
            v-show="menuButtonVisible"
            class="ml-4 px-2 py-1 border rounded border-primary-light text-primary-lightest"
            @click="openMenu"
          >
            Menu
          </button>
        </div>
      </div>

      <div
        ref="menu"
        class="w-full lg:w-auto relative z-0"
      >
        <div class="overflow-x-auto overflow-y-hidden scrolling-touch whitespace-no-wrap">
          <div class="pt-3 pb-3 lg:py-0 lg:my-0">
            <div class="hidden lg:inline-block">
              <button
                v-show="isInstallable"
                class="nav-link"
                @click="clickInstall"
              >
                <span class="mr-1">📥</span>
                Install App
              </button>
            </div>

            <nuxt-link
              to="/"
              class="nav-link"
            >
              Profile Search
            </nuxt-link>
            <nuxt-link
              to="/leaderboard"
              class="nav-link"
            >
              Leaderboard
            </nuxt-link>
            <nuxt-link
              to="/blog/guides"
              class="nav-link"
            >
              Guides
            </nuxt-link>
            <nuxt-link
              to="/tier-list/brawler"
              class="nav-link"
            >
              Brawler Tier List
            </nuxt-link>
            <nuxt-link
              to="/tier-list/map"
              class="nav-link"
            >
              Map Tier Lists
            </nuxt-link>
            <nuxt-link
              to="/status"
              class="nav-link"
            >
              Status
            </nuxt-link>
            <nuxt-link
              to="/about"
              class="nav-link"
            >
              Privacy
            </nuxt-link>
          </div>
        </div>
      </div>
    </nav>

    <nuxt />

    <div
      v-if="consentPopupVisible"
      class="fixed z-30 inset-0 w-full h-full flex justify-center items-center"
      style="background-color: rgba(0, 0, 0, 0.75)"
    >
      <div class="mx-2 py-2 max-w-xl border-4 rounded border-secondary-dark bg-secondary-darker flex flex-col justify-center items-center">
        <p class="text-center text-xl">
          Cookies? 🍪
        </p>
        <p class="mt-2 mx-2 text-center text-sm">
          Brawl Time stores your settings in a Cookie.
          Analytics and Advertisements may set Cookies as well.
        </p>
        <details class="mx-2 text-sm">
          Data that may be collected:
          <ul class="ml-2 list-disc list-inside">
            <li>Your Brawl Stars tag</li>
            <li>Device and Browser you use</li>
            <li>Your IP address</li>
            <li>Pages you open, Buttons you click</li>
            <li>Content visibility</li>
            <li>Errors and exceptions</li>
          </ul>
          <br>
          How the data is used:
          <ul class="ml-2 list-disc list-inside">
            <li>To generate reports about game statistics</li>
            <li>Customization of advertisements</li>
            <li>To improve the reliability of this service</li>
          </ul>
          <br>
          To collect this information, some data will be shared with Google Analytics, Google AdSense and Sentry.
          Your information will never be sold.
          <br>
          Read the privacy policy or update your preferences later <nuxt-link class="link" to="/about">here</nuxt-link>.
          <summary>More information</summary>
        </details>
        <p class="mt-2 mx-2 text-center">
          Enable Cookies for Settings, Analytics and Ads?
        </p>
        <div class="mt-3 text-sm flex flex-wrap">
          <button
            v-show="showCookieOptions"
            class="border rounded-sm py-1 w-24 mx-1 bg-red-600 hover:bg-red-500"
            @click="disableCookies"
          >
            Disable All
          </button>
          <button
            v-show="showCookieOptions"
            class="border rounded-sm py-1 w-24 mx-1 bg-yellow-600 hover:bg-yellow-500"
            @click="enableCookies"
          >
            Only Settings
          </button>
          <button
            v-show="!showCookieOptions"
            class="border rounded-sm py-1 w-24 mx-1 bg-secondary-darkest hover:bg-black"
            @click="showCookieOptions = true"
          >
            More Options
          </button>
          <button
            class="border rounded-sm py-1 w-24 mx-1 bg-green-600 hover:bg-green-500"
            @click="enableCookiesAndAds"
          >
            Enable All
          </button>
        </div>
      </div>
    </div>

    <footer class="bg-primary-darker py-2 text-sm text-center leading-normal">
      <p>
        &#169; 2018 - 2020 Brawl Time Ninja
        ({{ releaseVersion }})
      </p>
      <p>
        Discord Server: <a class="link" href="https://discord.gg/uYfgznq">uYfgznq</a>
        &mdash;
        Twitter: <a class="link" href="https://twitter.com/brawltimeninja">@BrawlTimeNinja</a>
      </p>
      <p class="text-xs leading-tight">
        This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it. For more information see Supercell's Fan Content Policy: www.supercell.com/fan-content-policy.
      </p>
      <div ref="adblock-bait">
        <div class="adBanner w-px h-px bg-transparent">
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  data() {
    return {
      showCookieOptions: false,
      lastScrollY: 0,
      lastScrollUpY: 0,
      menuButtonVisible: false,
    }
  },
  computed: {
    isDesktop(): boolean {
      return (<any>global).screen !== undefined && screen.width > 720
    },
    background(): string {
      return this.isDesktop
        ? require('~/assets/images/background/blue_desktop.jpg')
        : require('~/assets/images/background/blue_mobile.jpg')
    },
    releaseVersion(): string {
      return (<any>process.env).release
    },
    ...mapGetters({
      isInstallable: 'isInstallable',
    }),
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
    if ((<any>process).client) {
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

      window.addEventListener('appinstalled', this.installed)
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.setInstallPrompt(e)
      })
    }
  },
  mounted() {
    window.addEventListener('scroll', () => this.onScroll())
    this.openMenu()
    this.checkAdblock()
  },
  methods: {
    onScroll() {
      if (Math.abs(window.scrollY - this.lastScrollY) < 10) {
        return
      }

      const menu = this.$refs.menu as any
      if (window.scrollY < this.lastScrollY) {
        // scrolled up
        menu.style['margin-top'] = '0px'
        this.menuButtonVisible = false
        this.lastScrollUpY = window.scrollY
      } else {
        // scrolled down
        menu.style['margin-top'] = `-${(window.scrollY - this.lastScrollUpY) / 4}px`
        this.menuButtonVisible = true
      }

      this.lastScrollY = window.scrollY
    },
    openMenu() {
      this.menuButtonVisible = false
      const menu = this.$refs.menu as any
      menu.style['margin-top'] = '0px'
      // important: header style changes modify window.scrollY!
      this.lastScrollY = window.scrollY
      this.lastScrollUpY = window.scrollY
    },
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
    installed() {
      this.$ga.event('app', 'install')
    },
    async clickInstall() {
      this.$ga.event('app', 'click', 'install_header')
      await this.install()
    },
    checkAdblock() {
      const adsBlocked = (<any>this.$refs['adblock-bait']).clientHeight === 0
      this.$ga.set('dimension2', !adsBlocked)
      this.$ga.event('ads', 'blocked', adsBlocked.toString(), <any>{ nonInteraction: true })
    },
    enableAds() {
      if (this.adsAllowed && (<any>process).client) {
        // update consent preferences
        if ('adsbygoogle' in window) {
          (<any>window).adsbygoogle.pauseAdRequests = 0
        }
        this.$ga.enable()

        // track some meta data
        // play store allows only 1 ad/page - TWA is detected via referrer
        const isPwa = window.matchMedia('(display-mode: standalone)').matches
        const isTwa = document.referrer.startsWith('android-app')

        if (isPwa || isTwa) {
          this.setIsApp()
        }

        // set variables for split testing
        this.$ga.set('dimension1', process.env.branch)
        this.$ga.set('dimension3', isPwa)
        this.$ga.set('dimension4', isTwa)
      }
    },
    hideAds() {
      if ((<any>process).client) {
        const sheet = document.createElement('style')
        sheet.type = 'text/css'
        sheet.innerText = `.adswrapper { display: none; }`
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
      setInstallPrompt: 'setInstallPrompt',
      clearInstallPrompt: 'clearInstallPrompt',
      setTestGroup: 'setTestGroup',
    }),
    ...mapActions({
      install: 'install',
    })
  },
  watch: {
    // called after vuex-persist has loaded
    version() {
      // custom A/B test flag
      if (this.testGroup == undefined) {
        const group = ['player-only-top-ad', 'player-small-ads', 'control'][Math.floor(Math.random() * 3)]
        this.setTestGroup(group)
        console.log('user assigned to test group', this.testGroup)
      }
      this.$ga.set('dimension5', this.testGroup)
      console.log('user is part of test group', this.testGroup)
    },
  },
})
</script>

<style>
.bg-top-y {
  background-position-y: top;
}

.nav-link {
  @apply inline-block mr-4 text-primary-lighter border-b border-primary-lighter text-lg capitalize font-medium;
}

@screen lg {
  .nav-link {
    @apply border-0;
  }
}
</style>
