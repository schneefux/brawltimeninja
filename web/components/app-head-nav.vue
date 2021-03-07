<template>
  <div class="bg-yellow-400 text-gray-800 h-14 p-4 z-40 sticky top-0 flex items-center">
    <button
      @click="() => depth == 0 ? undefined : back()"
      class="h-6 w-6 mr-6"
    >
      <img
        v-if="depth == 0"
        src="~/assets/images/logo_with_crown_min.svg"
      >
      <font-awesome-icon
        v-else
        :icon="faArrowLeft"
        class="align-middle"
      ></font-awesome-icon>
    </button>
    <nuxt-link
      :to="localePath('/')"
      class="font-medium mr-auto leading-none text-xl"
      prefetch
    >
      {{ $t('nav.' + title) }}
    </nuxt-link>

    <install-button
      class="h-6 mr-4"
    ></install-button>

    <nuxt-link
      :to="localePath('/about')"
      class="h-6 mr-4"
    >
      <font-awesome-icon
        :icon="faInfo"
      ></font-awesome-icon>
    </nuxt-link>

    <locale-switcher
      class="h-6 text-2xs pr-7 bg-gray-200"
    ></locale-switcher>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { faInfo, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default Vue.extend({
  data() {
    return {
      depth: 0,
      title: 'Brawl Time Ninja',
    }
  },
  methods: {
    back() {
      this.depth -= 2
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
    },
  },
  created() {
    this.update()
  },
  watch: {
    '$route'() {
      this.depth++
      this.update()
    },
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
