<template>
  <div
    class="flex flex-col justify-between min-h-screen bg-primary text-grey-lighter bg-center bg-top-y"
    :style="`background-image: radial-gradient(circle closest-side, rgba(0, 0, 32, 0.6), rgba(0, 0, 0, 0.5)), url('${background}')`"
  >
    <nav class="bg-primary-dark px-4 pb-2 md:p-6 flex justify-between items-center flex-wrap sticky z-40 top-0 md:static">
      <div class="flex-shrink-0 bg-primary-dark z-40 pt-3 pb-1 md:py-0 w-full md:w-auto">
        <nuxt-link
          to="/"
          class="font-semibold text-xl text-white tracking-tighter"
        >
          Brawl Time Ninja
        </nuxt-link>
        <div class="md:hidden float-right">
          <button
            v-if="installPrompt !== undefined"
            class="px-2 py-1 border rounded border-primary-light text-primary-lightest"
            @click="install"
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
        class="w-full md:w-auto relative z-0"
      >
        <div class="overflow-x-auto overflow-y-hidden scrolling-touch whitespace-no-wrap overflow-scroll-gradient md:overflow-scroll-no-gradient">
          <div class="pt-3 pb-3 md:py-0 md:my-0">
            <div class="hidden md:inline-block">
              <button
                v-if="installPrompt !== undefined"
                class="nav-link"
                @click="install"
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
              to="/meta/brawler"
              class="nav-link"
            >
              Brawler Meta
            </nuxt-link>
            <nuxt-link
              to="/meta/map"
              class="nav-link"
            >
              Map Meta
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
      v-if="cookieBannerOpen"
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
            v-if="showCookieOptions"
            class="border rounded-sm py-1 w-24 mx-1 bg-red-600 hover:bg-red-500"
            @click="disableCookies"
          >
            Disable All
          </button>
          <button
            v-if="showCookieOptions"
            class="border rounded-sm py-1 w-24 mx-1 bg-yellow-600 hover:bg-yellow-500"
            @click="enableCookies"
          >
            Enable Cookie
          </button>
          <button
            v-if="!showCookieOptions"
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
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      cookieBannerOpen: false,
      showCookieOptions: false,
      installPrompt: undefined,
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
    ...mapState({
      blog: state => state.blog,
      version: state => state.version,
      adsAllowed: state => state.adsAllowed,
      cookiesAllowed: state => state.cookiesAllowed,
    }),
  },
  watch: {
    version(version) {
      if (version !== undefined) {
        this.cookieBannerOpen = !this.cookiesAllowed
      }
    },
    adsAllowed(allowed) {
      if (allowed) {
        const adsBlocked = this.$refs['adblock-bait'].clientHeight === 0
        this.$ga.event('ads', 'blocked', adsBlocked)
        if (!adsBlocked) {
          this.enableAds()
        }

        const isPwa = window.matchMedia('(display-mode: standalone)').matches

        this.$ga.enable()
        // set variables for split testing
        this.$ga.set('dimension1', env.branch)
        this.$ga.set('dimension2', !adsBlocked)
        this.$ga.set('dimension3', isPwa)
        // events should not affect bounce rate
        this.$ga.set('nonInteraction', true)
      }
    },
  },
  created() {
    if (process.client) {
      window.addEventListener('appinstalled', this.installed)
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.installPrompt = e
      })
    }
  },
  mounted() {
    window.addEventListener('scroll', () => this.onScroll())
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
    },
    enableCookiesAndAds() {
      this.cookieBannerOpen = false
      this.allowCookies()
      this.allowAds()
    },
    installed() {
      this.$ga.event('app', 'install')
    },
    async install() {
      this.$ga.event('app', 'click', 'install_header')
      this.installPrompt.prompt()
      const choice = await this.installPrompt.userChoice
      this.$ga.event('app', 'prompt', choice.outcome)
      this.installPrompt = undefined
    },
    ...mapMutations({
      allowCookies: 'allowCookies',
      allowAds: 'allowAds',
      enableAds: 'enableAds',
    })
  },
}
</script>

<style>
.bg-top-y {
  background-position-y: top;
}

.overflow-scroll-gradient::after {
  @apply absolute right-0 top-0 w-12 h-8 mt-1 pointer-events-none;
  content: '';
  background: linear-gradient(to right, transparent, theme('colors.primary-dark'));
}

@screen md {
  .md\:overflow-scroll-no-gradient::after {
    content: '';
    background: none;
  }
}

.nav-link {
  @apply inline-block mr-4 text-primary-lighter border-b border-primary-lighter text-lg capitalize font-medium;
}

@screen md {
  .nav-link {
    @apply border-0;
  }
}
</style>
