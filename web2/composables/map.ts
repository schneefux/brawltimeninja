import { computed, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const getMapName = (id: string|number|undefined, name: string|undefined) => {
  const i18n = useI18n()

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
  return computed(() => getMapName(id?.value, name?.value))
}
