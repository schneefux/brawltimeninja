<template>
  <div
    class="flex flex-col justify-between min-h-screen bg-primary text-grey-lighter bg-center bg-top-y"
    :style="`background-image: radial-gradient(circle closest-side, rgba(0, 0, 32, 0.6), rgba(0, 0, 0, 0.5)), url('${background}')`"
  >
    <nav class="bg-primary-dark p-4 md:p-6 flex justify-between items-center flex-wrap sticky z-100 top-0 md:static">
      <nuxt-link
        :to="localePath('index')"
        class="flex-shrink-0 font-semibold text-xl text-white tracking-tighter"
      >
        Brawl Time Ninja
      </nuxt-link>

      <div class="md:hidden">
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
          <nuxt-link
            :to="localePath('index')"
            class="md:hidden block mt-4 text-primary-lighter"
          >
            Home
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

          <details
            v-show="false"
            ref="localeDropdown"
            class="block md:inline-block mt-4 md:mt-0 md:ml-0 text-primary-lighter"
          >
            <summary class="w-4 md:ml-4">
              {{ locale.emoji }}
            </summary>
            <div class="absolute -ml-4 md:ml-0 mt-1 leading-normal bg-primary-dark">
              <nuxt-link
                v-for="l in locales"
                :key="l.code"
                :to="switchLocalePath(l.code)"
                class="block mx-4 text-primary-lighter"
              >
                {{ l.emoji }}
              </nuxt-link>
            </div>
          </details>
        </div>
      </div>
    </nav>

    <nuxt />

    <footer class="bg-primary-darker py-2 text-sm text-center leading-normal">
      <p>&#169; 2019 Brawl Time Ninja</p>
      <p class="text-xs leading-tight">
        This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it.
      </p>
    </footer>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      menuOpen: false,
    }
  },
  computed: {
    locale() {
      return this.$i18n.locales.filter(({ code }) => code === this.$i18n.locale)[0]
    },
    locales() {
      return this.$i18n.locales.filter(locale => locale !== this.locale)
    },
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
    }),
  },
  watch: {
    '$route'() {
      this.menuOpen = false
      this.$refs.localeDropdown.removeAttribute('open')
    },
  },
  created() {
    if (global.window !== undefined) {
      global.window.addEventListener('appinstalled', this.installed)
    }
  },
  destroyed() {
    if (global.window !== undefined) {
      global.window.addEventListener('appinstalled', this.installed)
    }
  },
  methods: {
    installed() {
      this.$ga.event('app', 'install')
    },
  },
}
</script>

<style scoped>
.bg-top-y {
  background-position-y: top;
}

details > summary {
  list-style: none;
}

details > summary::-webkit-details-marker {
  display: none;
}
</style>
