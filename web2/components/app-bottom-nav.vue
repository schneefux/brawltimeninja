<template>
  <b-app-bottom-nav
    tag="router-link"
    :screens="screens"
    :active-route="route.path"
    :ignore-route-prefix="localePath('/')"
  ></b-app-bottom-nav>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { faCalendarDay, faSearch, faMask } from '@fortawesome/free-solid-svg-icons'
import { Screen } from '@schneefux/klicker/components/ui/b-app-bottom-nav.vue'
import { BAppBottomNav } from '@schneefux/klicker/components'
import { useContext, useLocalePath } from '@/composables/compat'
import { useRoute } from 'vue-router'

export default defineComponent({
  components: {
    BAppBottomNav,
  },
  setup() {
    const { i18n } = useContext()
    const localePath = useLocalePath()

    const screens = computed<Screen[]>(() => {
      return [ {
        id: 'profile',
        icon: faSearch,
        name: i18n.t('nav.Profile'),
        target: localePath('/'),
        prefix: '',
      }, {
        id: 'events',
        icon: faCalendarDay,
        name: i18n.t('nav.Events'),
        target: localePath('/tier-list/map'),
        prefix: '/tier-list',
      }, {
        id: 'brawlers',
        icon: faMask,
        name: i18n.t('nav.Brawlers'),
        target: localePath('/tier-list/brawler'),
        prefix: '/tier-list/brawler',
      } ]
    })

    const route = useRoute()

    return {
      screens,
      route,
    }
  },
})
</script>
