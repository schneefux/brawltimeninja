<template>
  <b-app-bottom-nav
    tag="nuxt-link"
    :screens="screens"
    :active-route="$route.path"
    :ignore-route-prefix="localePath('/')"
  ></b-app-bottom-nav>
</template>

<script lang="ts">
import { defineComponent, useContext, computed } from '@nuxtjs/composition-api'
import { faCalendarDay, faSearch, faMask } from '@fortawesome/free-solid-svg-icons'
import { Screen } from '@schneefux/klicker/components/ui/b-app-bottom-nav.vue'
import { BAppBottomNav } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BAppBottomNav,
  },
  setup() {
    const { localePath, i18n } = useContext()
    const screens = computed<Screen[]>(() => [ {
      id: 'profile',
      icon: faSearch,
      name: i18n.t('nav.Profile') as string,
      target: localePath('/'),
      prefix: '',
    }, {
      id: 'events',
      icon: faCalendarDay,
      name: i18n.t('nav.Events') as string,
      target: localePath('/tier-list/map'),
      prefix: '/tier-list',
    }, {
      id: 'brawlers',
      icon: faMask,
      name: i18n.t('nav.Brawlers') as string,
      target: localePath('/tier-list/brawler'),
      prefix: '/tier-list/brawler',
    } ])

    return {
      screens,
    }
  },
})
</script>
