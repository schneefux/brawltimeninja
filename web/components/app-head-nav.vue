<template>
  <div class="bg-yellow-400 text-gray-800 h-14 p-4 z-40 sticky top-0 flex items-center">
    <button
      @click="back()"
      class="h-6 w-6 mr-8"
    >
      <img
        v-if="isTopLevel"
        src="~/assets/images/logo_with_crown_min.svg"
      >
      <font-awesome-icon
        v-else
        :icon="faArrowLeft"
        class="align-middle"
      ></font-awesome-icon>
    </button>
    <nuxt-link
      to="/"
      class="font-medium mr-auto leading-none text-xl"
      prefetch
    >
      {{ title }}
    </nuxt-link>

    <install-button
      class="h-6 mr-6"
    ></install-button>

    <nuxt-link
      to="/about"
      class="h-6"
    >
      <font-awesome-icon
        :icon="faInfo"
      ></font-awesome-icon>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { faInfo, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { screens } from './app-bottom-nav.vue'

export default Vue.extend({
  data() {
    return {
      isTopLevel: true,
      title: 'Brawl Time Ninja',
    }
  },
  methods: {
    back() {
      this.$router.go(-1)
    },
    update() {
      // TODO: update with Nuxt 3
      // $route.meta is merged into $nuxt.$options.context.route.meta
      // and not reactive
      // https://github.com/nuxt/nuxt.js/issues/5885#issuecomment-507670640

      const newTitle = this.$nuxt.$options.context.route.meta[0]?.title
      if (newTitle != undefined) {
        this.title = newTitle
      }
      this.isTopLevel = screens.some(s => s.matches.some(m => m == this.$route.path))
    },
  },
  created() {
    this.update()
  },
  watch: {
    '$route': 'update',
  },
  computed: {
    faArrowLeft() {
      return faArrowLeft
    },
    faInfo() {
      return faInfo
    },
  },
})
</script>
