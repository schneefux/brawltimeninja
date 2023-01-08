<template>
  <b-card
    :title="$attrs.title || (mode != undefined ? $t('mode.' + mode) : undefined)"
    :link="mapLink || modeLink"
    :title-link="modeLink"
    :subtitle="mapName"
    :subtitle-link="mapLink"
    :background="background"
    :color="mode != undefined ? 'bg-color-' + mode.toLowerCase() : undefined"
    :text-color="mode != undefined ? 'text-gray-200' : undefined"
    :icon="mode != undefined ? '/modes/' + camelToKebab(mode) + '/icon' : undefined"
    :icon-alt="$t('mode.' + mode)"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-slot:icon="data">
      <media-img-icon v-bind="data"></media-img-icon>
    </template>

    <template v-slot:preview><map-img
      v-if="id != undefined"
      
      :id="id"
      :map="map"
      clazz="h-12 w-12 object-contain"
    ></map-img></template>

    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slot"
      ></slot>
    </template>
  </b-card>
</template>

<script lang="ts">
import { camelToKebab, slugify } from '@/lib/util'
import { defineComponent, computed, useContext, toRefs } from 'vue'
import { useMapName } from '~/composables/map'

export default defineComponent({
  inheritAttrs: false,
  props: {
    mode: {
      // camel case
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      // enables map icon top right
      type: [String, Number],
    },
    nobackground: {
      type: Boolean
    },
  },
  setup(props) {
    const { $config, $supportsWebp, localePath } = useContext()

    const background = computed(() => {
      if (props.nobackground) {
        return undefined
      }
      const path = '/modes/' + camelToKebab(props.mode!) + '/background'
      const query = '?size=800'
      const url = $config.mediaUrl + path + ($supportsWebp ? '.webp' : '.jpg') + query
      return url
    })

    const modeLink = computed(() => props.mode != undefined ? localePath(`/tier-list/mode/${camelToKebab(props.mode)}`) : undefined)
    const mapLink = computed(() => props.mode != undefined && props.map != undefined ? localePath(`/tier-list/mode/${camelToKebab(props.mode)}/map/${slugify(props.map)}`) : undefined)

    const { id, map } = toRefs(props)
    const mapName = useMapName(id, map)

    return {
      mapName,
      camelToKebab,
      slugify,
      background,
      modeLink,
      mapLink,
    }
  },
})
</script>
