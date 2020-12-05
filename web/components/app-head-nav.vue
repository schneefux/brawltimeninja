<template>
  <div class="bg-primary-dark h-14 p-4 z-40 sticky top-0 flex items-center">
    <button
      @click="back()"
      class="mr-8"
    >
      <img
        v-if="isTopLevel"
        src="/icon.png"
        class="h-6 w-6"
      >
      <font-awesome-icon
        v-else
        :icon="faLongArrowAltLeft"
        class="h-6 w-6"
      ></font-awesome-icon>
    </button>
    <nuxt-link
      to="/"
      class="font-medium text-white mr-auto leading-none text-lg"
      prefetch
    >
      {{ title }}
    </nuxt-link>

    <install-button
      class="mr-6"
      mini
    ></install-button>

    <nuxt-link
      to="/about"
    >
      <font-awesome-icon
        :icon="faInfo"
        class="h-6 py-1"
      ></font-awesome-icon>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { faLongArrowAltLeft, faInfo } from '@fortawesome/free-solid-svg-icons'
import { screens } from './app-bottom-nav.vue'

export default Vue.extend({
  data() {
    return {
      isTopLevel: false,
      title: 'Brawl Time Ninja',
    }
  },
  methods: {
    back() {
      this.$router.go(-1)
    },
  },
  watch: {
    '$route'() {
      // TODO: update with Nuxt 3
      // $route.meta is merged into $nuxt.$options.context.route.meta
      // and not reactive
      // https://github.com/nuxt/nuxt.js/issues/5885#issuecomment-507670640

      const newTitle = this.$nuxt.$options.context.route.meta[0].title
      if (newTitle != undefined) {
        this.title = newTitle
      }
      this.isTopLevel = screens.some(s => s.matches.some(m => m == this.$route.path))
    },
  },
  computed: {
    faLongArrowAltLeft() {
      return faLongArrowAltLeft
    },
    faInfo() {
      return faInfo
    },
  },
})
</script>
