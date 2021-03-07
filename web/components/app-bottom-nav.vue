<template>
  <nav class="sticky bottom-0 z-40 h-14 bg-yellow-400 flex justify-around">
    <nuxt-link
      v-for="screen in screens"
      :key="screen.target"
      :to="localePath(screen.target)"
      :class="['flex-1 flex flex-col items-center justify-between pt-2 pb-3 px-3', {
        'text-gray-800': screen.id == active,
        'text-yellow-700': screen.id != active,
      }]"
      prefetch
    >
      <font-awesome-icon
        :icon="screen.icon"
        class="w-6 h-6"
      ></font-awesome-icon>
      <span class="text-xs leading-none">
        {{ $t('nav.' + screen.name) }}
      </span>
    </nuxt-link>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import { faCalendarDay, faSearch, faMask, faNewspaper, IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface Screen {
  id: string
  icon: IconDefinition
  name: string
  target: string
}

export const screens: Screen[] = [ {
  id: 'profile',
  icon: faSearch,
  name: 'Profile',
  target: '/',
}, {
  id: 'events',
  icon: faCalendarDay,
  name: 'Events',
  target: '/tier-list/map',
}, {
  id: 'brawlers',
  icon: faMask,
  name: 'Brawlers',
  target: '/tier-list/brawler',
}, {
  id: 'guides',
  icon: faNewspaper,
  name: 'Guides',
  target: '/blog/guides',
} ]

export default Vue.extend({
  data() {
    return {
      screens,
      active: 'profile',
    }
  },
  methods: {
    update() {
      // TODO: update with Nuxt 3
      // $route.meta is merged into $nuxt.$options.context.route.meta
      // and not reactive
      // https://github.com/nuxt/nuxt.js/issues/5885#issuecomment-507670640

      const newScreen = this.$nuxt.$options.context.route.meta[0]?.screen
      if (newScreen != undefined) {
        if (screens.some(s => s.id == newScreen)) {
          this.active = newScreen
        } else {
          console.error('Screen does not exist: ' + newScreen)
        }
      }
    },
  },
  created() {
    this.update()
  },
  watch: {
    '$route': 'update',
  },
})
</script>
