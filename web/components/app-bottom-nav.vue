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
import { defineComponent, ref, useContext, useRoute, watch, computed } from '@nuxtjs/composition-api'
import { faCalendarDay, faSearch, faMask, faNewspaper, IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface Screen {
  id: string
  icon: IconDefinition
  name: string
  target: string
}

export default defineComponent({
  setup(props, { root }) {
    const active = ref('profile')

    const { localePath } = useContext()
    const screens = computed<Screen[]>(() => [ {
      id: 'profile',
      icon: faSearch,
      name: 'Profile',
      target: localePath('/'),
    }, {
      id: 'events',
      icon: faCalendarDay,
      name: 'Events',
      target: localePath('/tier-list/map'),
    }, {
      id: 'brawlers',
      icon: faMask,
      name: 'Brawlers',
      target: localePath('/tier-list/brawler'),
    }, {
      id: 'guides',
      icon: faNewspaper,
      name: 'Guides',
      target: '/blog/guides',
    } ])

    const update = () => {
      // TODO: update with Nuxt 3
      // $route.meta is merged into $nuxt.$options.context.route.meta
      // and not reactive
      // https://github.com/nuxt/nuxt.js/issues/5885#issuecomment-507670640

      const newScreen = root.$nuxt.$options.context.route.meta[0]?.screen
      if (newScreen != undefined) {
        if (screens.value.some(s => s.id == newScreen)) {
          active.value = newScreen
        } else {
          console.error('Screen does not exist: ' + newScreen)
        }
      }
    }

    update()

    const route = useRoute()
    watch(route, update)

    return {
      active,
      screens,
    }
  },
})
</script>
