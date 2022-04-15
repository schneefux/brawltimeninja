<template>
  <nav class="sticky bottom-0 z-40 h-14 bg-yellow-400 flex justify-around">
    <nuxt-link
      v-for="screen in screens"
      :key="screen.target"
      :to="screen.target"
      :class="['flex-1 flex flex-col items-center justify-between pt-2 pb-3 px-3', {
        'text-gray-800': screen.id == active,
        'text-yellow-700': screen.id != active,
      }]"
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
import { defineComponent, ref, useContext, useRoute, computed, watchEffect } from '@nuxtjs/composition-api'
import { faCalendarDay, faSearch, faMask, faNewspaper, IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface Screen {
  id: string
  icon: IconDefinition
  name: string
  target: string
  prefix: string
}

export default defineComponent({
  setup() {
    const active = ref('profile')

    const { localePath } = useContext()
    const screens = computed<Screen[]>(() => [ {
      id: 'profile',
      icon: faSearch,
      name: 'Profile',
      target: localePath('/'),
      prefix: '',
    }, {
      id: 'events',
      icon: faCalendarDay,
      name: 'Events',
      target: localePath('/tier-list/map'),
      prefix: '/tier-list',
    }, {
      id: 'brawlers',
      icon: faMask,
      name: 'Brawlers',
      target: localePath('/tier-list/brawler'),
      prefix: '/tier-list/brawler',
    } ])

    const route = useRoute()
    watchEffect(() => {
      const langPrefix = localePath('/')
      const path = route.value.path.slice(langPrefix.length - 1)

      let longestMatch: Screen|undefined
      let longestMatchLength = 0

      for (const screen of screens.value) {
        const screenUrlLength = screen.prefix.split('/').length
        if (screenUrlLength > longestMatchLength && path.startsWith(screen.prefix)) {
          longestMatch = screen
          longestMatchLength = screenUrlLength
        }
      }

      if (longestMatch != undefined) {
        active.value = longestMatch.id
      }
    })

    return {
      active,
      screens,
    }
  },
})
</script>
