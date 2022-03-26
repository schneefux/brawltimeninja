import { computed, useContext, Ref } from '@nuxtjs/composition-api'
import { NuxtI18nInstance } from '@nuxtjs/i18n'

export const getMapName = (i18n: NuxtI18nInstance, id: string|number|undefined, name: string|undefined) => {
  if (id == undefined) {
    return name
  }

  if (id == 0) {
    // competition entry/winner
    return name
  }

  if (i18n.te(`map.${id}`)) {
    return i18n.t(`map.${id}`) as string
  }

  // no translation available, fall back to English name from database
  return name
}

export const useMapName = (id: Ref<string|number|undefined>|undefined, name: Ref<string|undefined>|undefined) => {
  const { i18n } = useContext()

  return computed(() => getMapName(i18n, id?.value, name?.value))
}
