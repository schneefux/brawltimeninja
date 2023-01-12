<template>
  <div>
    <!-- included only for SEO -->
    <breadcrumbs
      :links="links"
      class="hidden"
    ></breadcrumbs>

    <div class="flex items-center gap-x-4">
      <s-mode-map
        :model-value="slices"
        :on-input="jumpToModeMap"
        class="my-4"
      ></s-mode-map>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue'
import { SliceValue } from '@schneefux/klicker/types'
import { useMapName } from '~/composables/map'
import { camelToKebab, slugify } from '~/lib/util'
import { useContext, useRouter } from '@/composables/compat'

export default defineComponent({
  props: {
    mode: {
      type: String,
      required: false
    },
    map: {
      type: String,
      required: false
    },
    id: {
      type: String,
      required: false
    },
  },
  setup(props) {
    const modePath = computed(() => props.mode != undefined ? `/tier-list/mode/${camelToKebab(props.mode)}` : '')
    const mapPath = computed(() => props.map != undefined ? `${modePath.value}/map/${slugify(props.map)}` : '')

    const { id, map } = toRefs(props)
    const mapName = useMapName(id, map)

    const router = useRouter()
    const jumpToModeMap = (slices: Partial<SliceValue>) => {
      const mode = (slices.mode ?? [])[0]
      const map = (slices.map ?? [])[0]

      if (mode == undefined) {
        router.push('/tier-list/brawler')
        return
      }

      if (map == undefined) {
        router.push(`/tier-list/mode/${camelToKebab(mode)}`)
        return
      }

      router.push(`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}`)
    }

    const { i18n } = useContext()
    const links = computed(() => ([
      {
        path: '/tier-list/map',
        name: i18n.tc('map', 2),
      },
      ...(props.mode != undefined ? [{
        path: modePath.value,
        name: i18n.t('mode.' + props.mode),
      }] : []),
      ...(map != undefined ? [{
        path: mapPath.value,
        name: mapName.value,
      }] : []),
    ]))

    const slices = computed(() => ({
      mode: props.mode != undefined ? [props.mode] : [],
      map: props.map != undefined ? [props.map] : [],
    }))

    return {
      jumpToModeMap,
      links,
      slices,
    }
  },
})
</script>
