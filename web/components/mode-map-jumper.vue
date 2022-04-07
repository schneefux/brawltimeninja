<template>
  <div>
    <!-- included only for SEO -->
    <breadcrumbs
      :links="[
        {
          path: '/tier-list/map',
          name: $tc('map', 2),
        },
        ...(mode != undefined ? [{
          path: modePath,
          name: $t('mode.' + mode),
        }] : []),
        ...(map != undefined ? [{
          path: mapPath,
          name: mapName,
        }] : []),
      ]"
      class="hidden"
    ></breadcrumbs>

    <div class="flex items-center gap-x-4">
      <s-mode-map
        :value="{
          mode: mode != undefined ? [mode] : [],
          map: map != undefined ? [map] : [],
        }"
        :on-input="jumpToModeMap"
        class="my-4"
      ></s-mode-map>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs, useContext, useRouter } from '@nuxtjs/composition-api'
import { SliceValue } from '~/../klicker/types'
import { useMapName } from '~/composables/map'
import { camelToKebab, slugify } from '~/lib/util'

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
    const { localePath } = useContext()
    const jumpToModeMap = (slices: SliceValue) => {
      const mode = (slices.mode ?? [])[0]
      const map = (slices.map ?? [])[0]

      if (mode == undefined) {
        router.push(localePath('/tier-list/brawler'))
        return
      }

      if (map == undefined) {
        router.push(localePath(`/tier-list/mode/${camelToKebab(mode)}`))
        return
      }

      router.push(localePath(`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}`))
    }

    return {
      mapPath,
      mapName,
      modePath,
      jumpToModeMap,
    }
  },
})
</script>