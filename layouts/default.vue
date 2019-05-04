<template>
  <div
    class="flex flex-col justify-between min-h-screen bg-primary text-grey-lighter bg-center bg-top-y"
    :style="`background-image: radial-gradient(circle closest-side, rgba(0, 0, 32, 0.6), rgba(0, 0, 0, 0.5)), url('${background}')`">
    <nav class="bg-primary-dark p-4 md:p-6 flex justify-between items-center flex-wrap sticky pin-t md:static">
      <nuxt-link to="/" class="no-underline flex-no-shrink font-semibold text-xl text-white tracking-tight">
        Brawlstars Time Ninja
      </nuxt-link>

      <div class="md:hidden">
        <button
          class="flex px-3 py-2 border rounded text-primary-light border-primary-light"
          @click="menuOpen = !menuOpen"
        >
          <svg class="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
        </button>
      </div>

      <div
        class="w-full md:w-auto md:block"
        :class="{ 'hidden': !menuOpen }"
      >
        <div class="text-lg capitalize font-medium">
          <nuxt-link
            to="/"
            class="md:hidden block mt-4 no-underline text-primary-lighter"
          >
            Home
          </nuxt-link>
          <nuxt-link
            v-for="topic in topics"
            :key="topic"
            :to="`/blog/${topic}`"
            class="block md:inline-block mt-4 md:mt-0 md:ml-4 no-underline text-primary-lighter"
          >
            {{ topic }}
          </nuxt-link>
          <nuxt-link
            to="/about"
            class="block md:inline-block mt-4 md:mt-0 md:ml-4 no-underline text-primary-lighter"
          >
            Privacy
          </nuxt-link>
        </div>
      </div>
    </nav>

    <nuxt />

    <footer class="bg-primary-darker py-2 text-sm text-center leading-normal">
      <p>&#169; 2019 Brawlstars Time Ninja</p>
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
    },
  },
}
</script>

<style>
.bg-top-y {
  background-position-y: top;
}
</style>
