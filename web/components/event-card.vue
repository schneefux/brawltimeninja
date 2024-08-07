<template>
  <b-card
    :title="mode != undefined ? $t('mode.' + mode) : undefined"
    :link="mapLink || modeLink"
    :title-link="modeLink"
    :subtitle="mapName"
    :subtitle-link="mapLink"
    :background="background"
    :color="mode != undefined ? 'bg-color-' + mode.toLowerCase() : undefined"
    :text-color="mode != undefined ? 'text-gray-200' : undefined"
    :icon="mode != undefined ? '/modes/' + camelToKebab(mode) + '/icon' : undefined"
    :icon-alt="$t('mode.' + mode)"
  >
    <template v-slot:icon="data">
      <media-img-icon v-bind="data"></media-img-icon>
    </template>

    <template v-if="!nopreview" v-slot:preview>
      <slot name="preview">
        <map-img
          v-if="eventId != undefined && map != undefined"
          :event-id="eventId"
          :map="map"
          clazz="h-12 w-12 object-contain"
        ></map-img>
      </slot>
    </template>

    <template v-if="'infobar' in $slots" v-slot:infobar>
      <slot name="infobar"></slot>
    </template>
    <template v-if="'content' in $slots" v-slot:content>
      <slot name="content"></slot>
    </template>

    <!-- TODO: causes hydration error, see https://github.com/vuejs/core/issues/7095
    <template
      v-for="(_, slot) of $slots"
      v-slot:[slot]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slot"
      ></slot>
    </template>
    -->
  </b-card>
</template>

<script lang="ts">
import { camelToKebab, slugify } from '~/lib/util'
import { defineComponent, computed, toRefs } from 'vue'
import { useMapName } from '~/composables/map'
import { useConfig, useLocalePath } from '~/composables/compat'
import { useSupportsWebp } from '~/composables/webp'

export default defineComponent({
  props: {
    mode: {
      // camel case
      type: String,
    },
    map: {
      type: String,
    },
    eventId: {
      // enables map icon top right
      type: [String, Number],
    },
    nobackground: {
      type: Boolean
    },
    nopreview: {
      type: Boolean
    },
  },
  setup(props) {
    const $config = useConfig()
    const localePath = useLocalePath()
    const supportsWebp = useSupportsWebp()

    const background = computed(() => {
      if (props.nobackground) {
        return undefined
      }
      const path = '/modes/' + camelToKebab(props.mode!) + '/background'
      const query = '?size=800'
      const url = $config.mediaUrl + path + (supportsWebp.value ? '.webp' : '.jpg') + query
      return url
    })

    const modeLink = computed(() => props.mode != undefined ? localePath(`/tier-list/mode/${camelToKebab(props.mode)}`) : undefined)
    const mapLink = computed(() => props.mode != undefined && props.map != undefined ? localePath(`/tier-list/mode/${camelToKebab(props.mode)}/map/${slugify(props.map)}`) : undefined)

    const { eventId, map } = toRefs(props)
    const mapName = useMapName(eventId, map)

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
