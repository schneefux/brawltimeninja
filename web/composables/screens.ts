import { faCalendarDay, faSearch, faMask } from '@fortawesome/free-solid-svg-icons'
import { Screen } from '@schneefux/klicker/composables/screen-active'
import { computed } from "vue"
import { useI18n } from 'vue-i18n'
import { useLocalePath } from './compat'

export function useScreens() {
  const i18n = useI18n()
  const localePath = useLocalePath()

  return computed<Screen[]>(() => {
    return [ {
      id: 'profile',
      icon: faSearch,
      name: i18n.t('nav.Profile'),
      target: localePath('/'),
      prefix: '',
    }, {
      id: 'events',
      icon: faCalendarDay,
      name: i18n.t('map', 2),
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
}
