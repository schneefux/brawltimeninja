<template>
  <div
    class="flex flex-col justify-between min-h-screen bg-primary text-grey-lighter bg-center bg-top-y"
    :style="`background-image: radial-gradient(circle closest-side, rgba(0, 0, 32, 0.6), rgba(0, 0, 0, 0.5)), url('${background}')`"
  >
    <nav class="bg-primary-dark p-4 md:p-6 flex justify-between items-center flex-wrap sticky z-40 top-0 md:static">
      <nuxt-link
        to="/"
        class="flex-shrink-0 font-semibold text-xl text-white tracking-tighter"
      >
        Brawl Time Ninja
      </nuxt-link>

      <div class="md:hidden flex">
        <button
          v-if="installPrompt !== undefined"
          class="mr-4 text-sm px-2 py-2 border rounded text-primary-lightest border-primary-light"
          @click="install"
        >
          <span class="mr-1">📥</span>
          Install App
        </button>

        <button
          class="flex px-3 py-2 border rounded text-primary-light border-primary-light"
          @click="menuOpen = !menuOpen"
        >
          <svg class="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>

      <div
        class="w-full md:w-auto md:block"
        :class="{ 'hidden': !menuOpen }"
      >
        <div class="text-lg capitalize font-medium">
          <button
            v-if="installPrompt !== undefined"
            class="text-lg font-medium mr-4 hidden md:inline-block text-primary-lighter"
            @click="install"
          >
            Install App
          </button>

          <nuxt-link
            to="/"
            class="block md:inline-block mt-4 md:mt-0 text-primary-lighter"
          >
            Home
          </nuxt-link>
          <nuxt-link
            to="/meta/brawler"
            class="block md:inline-block mt-4 md:mt-0 md:ml-4 text-primary-lighter"
          >
            Brawler Meta
          </nuxt-link>
          <nuxt-link
            to="/meta/map"
            class="block md:inline-block mt-4 md:mt-0 md:ml-4 text-primary-lighter"
          >
            Map Meta
          </nuxt-link>
          <nuxt-link
            to="/leaderboard"
            class="block md:inline-block mt-4 md:mt-0 md:ml-4 text-primary-lighter"
          >
            Leaderboard
          </nuxt-link>
          <nuxt-link
            v-for="topic in topics"
            :key="topic"
            :to="`/blog/${topic}`"
            class="block md:inline-block mt-4 md:mt-0 md:ml-4 text-primary-lighter"
          >
            {{ topic }}
          </nuxt-link>
          <nuxt-link
            to="/about"
            class="block md:inline-block mt-4 md:mt-0 md:ml-4 text-primary-lighter"
          >
            Privacy
          </nuxt-link>
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
    </footer>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      menuOpen: false,
      cookieBannerOpen: false,
      showCookieOptions: false,
      installPrompt: undefined,
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
    '$route'() {
      this.menuOpen = false
    },
    version() {
      if (this.version !== undefined) {
        this.cookieBannerOpen = !this.cookiesAllowed
      }
    },
    adsAllowed() {
      if (this.adsAllowed) {
        this.$ga.enable()
      }
    },
  },
  created() {
    if (process.client) {
      window.addEventListener('appinstalled', this.installed)
    }
  },
  destroyed() {
    if (process.client) {
      window.removeEventListener('appinstalled', this.installed)
    }
  },
  mounted() {
    if (process.client) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.installPrompt = e
      })
    }
  },
  methods: {
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
      this.$ga.event('app', 'install_header', 'clicked')
      this.installPrompt.prompt()
      const choice = await this.installPrompt.userChoice
      this.$ga.event('app', 'prompt', choice.outcome)
      this.installPrompt = undefined
    },
    ...mapMutations({
      allowCookies: 'allowCookies',
      allowAds: 'allowAds',
    })
  },
}
</script>

<style>
.bg-top-y {
  background-position-y: top;
}
</style>
