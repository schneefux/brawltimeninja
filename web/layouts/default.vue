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
              v-for="topic in topics"
              :key="topic"
              :to="`/blog/${topic}`"
              class="nav-link"
            >
              {{ topic }}
            </nuxt-link>
            <nuxt-link
              to="/tier-list/brawler"
              class="nav-link"
            >
              Brawler Tier List
            </nuxt-link>
            <nuxt-link
              to="/tier-list/mode"
              class="nav-link"
            >
              Mode Tier Lists
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
      v-show="cookieBannerOpen"
      class="fixed z-30 inset-0 w-full h-full flex justify-center items-center"
      style="background-color: rgba(0, 0, 0, 0.75)"
    >
      <div class="mx-2 py-2 max-w-xl border-4 rounded border-secondary-dark bg-secondary-darker flex flex-col justify-center items-center">
        <p class="text-center text-xl">
          Cookies? 🍪
        </p>
        <p class="mt-2 mx-2 text-center text-sm">
          Brawl Time saves your tag in a Cookie. Analytics and Advertisements support the development of this site but usage data is sent to Google.
        </p>
        <p class="mt-1 mx-2 text-center">
          Enable Cookie, Analytics and Ads?
        </p>
        <div class="mt-2 text-sm flex flex-wrap">
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
            Enable Cookie
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
        &#169; 2019 Brawl Time Ninja &mdash; Discord Server:
        <a class="link" href="https://discord.gg/uYfgznq">uYfgznq</a>
      </p>
      <p class="text-xs leading-tight">
        This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it.
      </p>
      <div ref="adblock-bait">
        <div class="adBanner w-px h-px bg-transparent">
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      cookieBannerOpen: false,
      showCookieOptions: false,
      lastScrollY: 0,
      lastScrollUpY: 0,
      menuButtonVisible: false,
    }
  },
  computed: {
    topics() {
      return Object.keys(this.blog)
        .map(topic => topic.replace('_', ' '))
    },
    isDesktop() {
      return global.screen !== undefined && screen.width > 720
    },
    background() {
      return this.isDesktop
        ? require('~/assets/images/background/blue_desktop.jpg')
        : require('~/assets/images/background/blue_mobile.jpg')
    },
    ...mapGetters({
      isInstallable: 'isInstallable',
    }),
    ...mapState({
      blog: state => state.blog,
      version: state => state.version,
      adsAllowed: state => state.adsAllowed,
      cookiesAllowed: state => state.cookiesAllowed,
      isApp: state => state.isApp,
    }),
  },
  watch: {
    // called after vuex-persist has loaded the client's data
    version(version) {
      if (version !== undefined && process.client) {
        // open banner if user has not opted in & Ezoic did not load the consent manager popup
        console.log('ezoic CMP popup visible', window.__cmp == undefined)
        this.cookieBannerOpen = !this.cookiesAllowed && window.__cmp == undefined
      }
    },
    adsAllowed(allowed) {
      if (!allowed && process.client) {
        this.disableAds()
      }
      if (allowed && process.client) {
        const adsBlocked = this.$refs['adblock-bait'].clientHeight === 0
        if (!adsBlocked) {
          this.enableAds()
          // on Chrome, lazy-loading of ads does not work on first visit
          // this workaround fixes it
          if ('adsbygoogle' in window) {
            window.adsbygoogle.pauseAdRequests = 0
          }
        } else {
          this.disableAds()
        }

        // play store allows only 1 ad/page - TWA is detected via referrer
        const isPwa = window.matchMedia('(display-mode: standalone)').matches
        const isTwa = document.referrer.startsWith('android-app')

        if (isPwa || isTwa) {
          this.setIsApp()
        }

        if ('$ga' in this) {
          this.$ga.enable()
          // set variables for split testing
          this.$ga.set('dimension1', process.env.branch)
          this.$ga.set('dimension2', !adsBlocked)
          this.$ga.set('dimension3', isPwa)
          this.$ga.set('dimension4', isTwa)
          this.$ga.event('ads', 'blocked', adsBlocked, { nonInteraction: true })
        }
      }
    },
  },
  created() {
    if (process.client) {
      window.addEventListener('appinstalled', this.installed)
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.setInstallPrompt(e)
      })
    }
  },
  mounted() {
    window.addEventListener('scroll', () => this.onScroll())
    if ('update_cookieconsent_options' in window) {
      // TODO hides Ezoic cookie constent banner
      console.log('hiding ezoic cookie consent banner')
      window.update_cookieconsent_options({markup: '<i></i>'})
    }
    window.EzConsentCallback = (consent) => {
      this.cookieBannerOpen = false

      if (consent.preferences) {
        this.allowCookies()
      }

      if (consent.statistics && '$ga' in this) {
        this.$ga.enable()
      }

      if (consent.marketing) {
        this.allowAds()
      } else {
        this.disableAds()
      }
    }
    this.openMenu()
  },
  methods: {
    onScroll() {
      if (Math.abs(window.scrollY - this.lastScrollY) < 10) {
        return
      }

      if (window.scrollY < this.lastScrollY) {
        // scrolled up
        this.$refs.menu.style['margin-top'] = '0px'
        this.menuButtonVisible = false
        this.lastScrollUpY = window.scrollY
      } else {
        // scrolled down
        this.$refs.menu.style['margin-top'] = `-${(window.scrollY - this.lastScrollUpY) / 4}px`
        this.menuButtonVisible = true
      }

      this.lastScrollY = window.scrollY
    },
    openMenu() {
      this.menuButtonVisible = false
      this.$refs.menu.style['margin-top'] = '0px'
      // important: header style changes modify window.scrollY!
      this.lastScrollY = window.scrollY
      this.lastScrollUpY = window.scrollY
    },
    disableCookies() {
      this.cookieBannerOpen = false
    },
    enableCookies() {
      this.cookieBannerOpen = false
      this.allowCookies()
      this.disallowAds()
    },
    enableCookiesAndAds() {
      this.cookieBannerOpen = false
      this.allowCookies()
      this.allowAds()
    },
    installed() {
      if ('$ga' in this) {
        this.$ga.event('app', 'install')
      }
    },
    async clickInstall() {
      if ('$ga' in this) {
        this.$ga.event('app', 'click', 'install_header')
      }
      await this.install()
    },
    ...mapMutations({
      allowCookies: 'allowCookies',
      allowAds: 'allowAds',
      disallowAds: 'disallowAds',
      enableAds: 'enableAds',
      disableAds: 'disableAds',
      setIsApp: 'setIsApp',
      setInstallPrompt: 'setInstallPrompt',
      clearInstallPrompt: 'clearInstallPrompt',
    }),
    ...mapActions({
      install: 'install',
    })
  },
}
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
