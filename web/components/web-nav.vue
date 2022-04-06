<template>
  <nav class="bg-yellow-400 text-gray-800 p-6 flex justify-between items-center flex-wrap gap-y-3 z-40 sticky top-0 lg:static">
    <nuxt-link
      :to="localePath('/')"
      class="font-semibold text-xl tracking-tight leading-tight"
      prefetch
    >
      Brawl Time Ninja
    </nuxt-link>

    <navigator
      class="relative pl-8 mr-auto"
    ></navigator>

    <div class="overflow-x-auto overflow-y-hidden whitespace-nowrap space-x-4">
      <install-button></install-button>

      <ul class="inline-block space-x-4">
        <li
          v-for="link in links"
          :key="link.target"
          class="inline"
        >
          <nuxt-link
            :to="link.target"
            class="text-lg hover:text-gray-800/75"
            exact-active-class="text-red-800"
          >
            {{ $t('nav.' + link.name) }}
          </nuxt-link>
        </li>
      </ul>

      <locale-switcher
        class="border-0 align-text-top !text-2xs pr-7"
      ></locale-switcher>
    </div>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const { localePath } = useContext()

    const links = computed(() => [ {
      name: 'Profile Search',
      target: localePath('/'),
    }, {
      name: 'Brawler Tier List',
      target: localePath('/tier-list/brawler'),
    }, {
      name: 'Map Tier Lists',
      target: localePath('/tier-list/map'),
    }, {
      name: 'Guides',
      target: '/blog/guides',
    } ])

    return {
      links,
    }
  },
})
</script>
