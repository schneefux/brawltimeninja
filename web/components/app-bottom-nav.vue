<template>
  <nav class="sticky bottom-0 z-40 h-14 bg-primary-dark flex justify-around">
    <nuxt-link
      v-for="link in links"
      :key="link.target"
      :to="link.target"
      :class="['flex flex-col items-center justify-between pt-2 pb-3 px-3', {
        'text-primary-lightest': link.target == activeTarget,
        'text-primary-light': link.target != activeTarget,
      }]"
      prefetch
    >
      <font-awesome-icon
        :icon="link.icon"
        class="w-6 h-6"
      ></font-awesome-icon>
      <span class="text-xs leading-none">
        {{ link.name }}
      </span>
    </nuxt-link>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import { faCalendarDay, faSearch, faMask, faNewspaper, IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface Screen {
  icon: IconDefinition
  name: string
  target: string
  matches: string[]
}

export const screens: Screen[] = [ {
    icon: faSearch,
    name: 'Profile',
    target: '/',
    matches: ['', '/', '/player'],
  }, {
    icon: faCalendarDay,
    name: 'Events',
    target: '/tier-list/map',
    matches: ['/tier-list/map', '/tier-list/mode'],
  }, {
    icon: faMask,
    name: 'Brawlers',
    target: '/tier-list/brawler',
    matches: ['/tier-list/brawler', '/tier-list/starpowers', '/tier-list/gadgets'],
  }, {
    icon: faNewspaper,
    name: 'Guides',
    target: '/blog/guides',
    matches: ['/blog'],
  },
]

export default Vue.extend({
  data() {
    return {
      links: screens,
    }
  },
  computed: {
    activeTarget(): string {
      let longestPrefix = 0
      let bestMatch: Screen = screens[0]
      for (const s of screens) {
        for (const m of s.matches) {
          const prefixLength = m.split('/').length
          if (this.$route.path.startsWith(m) && prefixLength > longestPrefix) {
            bestMatch = s
          }
        }
      }
      return bestMatch.target
    },
  },
})
</script>
