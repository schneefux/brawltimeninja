import { computed, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const getMapName = (i18n: ReturnType<typeof useI18n>, id: string|number|undefined, name: string|undefined) => {
  if (id == undefined) {
    return name
  }

  if (id == 0) {
    // competition entry/winner
    return name
  }

  if (i18n.t(`map.${id}`) != `map.${id}`) {
    return i18n.t(`map.${id}`)
  }

  // no translation available, fall back to English name from database
  return name
}

export const useMapName = (id: Ref<string|number|undefined>|undefined, name: Ref<string|undefined>|undefined) => {
  const i18n = useI18n()

  return computed(() => getMapName(i18n, id?.value, name?.value))
}
