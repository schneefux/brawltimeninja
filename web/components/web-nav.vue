<template>
  <nav class="bg-yellow-400 text-gray-800 px-4 pb-2 lg:p-6 flex justify-between items-center flex-wrap sticky z-40 top-0 lg:static">
    <div class="bg-yellow-400 flex-shrink-0 z-40 pt-3 pb-1 lg:py-0 w-full lg:w-auto">
      <nuxt-link
        :to="localePath('/')"
        class="font-semibold text-xl tracking-tighter leading-tight"
        prefetch
      >
        Brawl Time Ninja
      </nuxt-link>
      <div class="lg:hidden float-right">
        <install-button></install-button>
        <button
          v-show="menuButtonVisible"
          class="ml-4 px-2 py-1 border-2 -my-2 rounded border-yellow-600 leading-none"
          @click="openMenu"
        >
          {{ $t('nav.Menu') }}
        </button>
      </div>
    </div>

    <div
      ref="menu"
      class="w-full lg:w-auto relative z-0"
    >
      <div class="overflow-x-auto overflow-y-hidden whitespace-nowrap">
        <div class="pt-3 pb-3 lg:py-0 lg:my-0 space-x-3">
          <div class="hidden lg:inline-block">
            <install-button></install-button>
          </div>

          <nuxt-link
            v-for="link in links"
            :key="link.target"
            :to="link.target"
            class="inline-block underline lg:border-0 text-lg font-medium hover:text-red-800"
            exact-active-class="text-red-800"
          >
            {{ $t('nav.' + link.name) }}
          </nuxt-link>

          <locale-switcher
            class="lg:border-0 align-text-top !text-2xs pr-7 bg-gray-200"
          ></locale-switcher>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      lastScrollY: 0,
      lastScrollUpY: 0,
      menuButtonVisible: false,
      menuLocked: false,
    }
  },
  mounted() {
    window.addEventListener('scroll', () => this.onScroll())
    this.openMenu()
  },
  computed: {
    links() {
      return [ {
        name: 'Profile Search',
        target: this.localePath('/'),
      }, {
        name: 'Brawler Tier List',
        target: this.localePath('/tier-list/brawler'),
      }, {
        name: 'Map Tier Lists',
        target: this.localePath('/tier-list/map'),
      }, {
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
  },
  methods: {
    onScroll() {
      if (this.menuLocked) {
        // ignore
        this.lastScrollY = window.scrollY
        this.lastScrollUpY = window.scrollY
        return
      }

      if (Math.abs(window.scrollY - this.lastScrollY) < 10) {
        return
      }

      const menu = this.$refs.menu as HTMLElement
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
  },
})
</script>
