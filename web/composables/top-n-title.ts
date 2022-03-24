import { computed, useContext, Ref } from '@nuxtjs/composition-api'
import { SliceValue } from '@schneefux/klicker/types'

export default function useTopNTitle(i18nPrefix: string, sliceRef: Ref<SliceValue>, id: Ref<string|number|undefined>|undefined, args?: Ref<Record<string, any>>) {
  const { i18n } = useContext()

  return computed(() => {
    const mode = sliceRef.value?.mode?.[0]
    const map = sliceRef.value?.map?.[0]

    if (mode == undefined) {
      return i18n.t(i18nPrefix + '.long', args?.value) as string
    }
    if (map == undefined) {
      return i18n.t(i18nPrefix + '.for.mode', {
        mode: i18n.t('mode.' + mode) as string,
        ...args?.value,
      }) as string
    }
    return i18n.t(i18nPrefix + '.for.map', {
      mode: i18n.t('mode.' + mode) as string,
      map: (i18n.te(`map.${id?.value}`) && i18n.t(`map.${id?.value}`) || map) as string,
      ...args?.value,
    }) as string
  })
}
