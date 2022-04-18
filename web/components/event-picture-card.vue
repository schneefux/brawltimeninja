<template>
  <event-card
    :mode="mode"
    :map="map"
    :link="mapPath"
    :id="id"
    nobackground
    v-on="$listeners"
  >
    <template v-slot:preview></template>
    <div
      slot="content"
      class="pt-4 h-full flex flex-col justify-center"
    >
      <map-img
        :id="id"
        :map="map"
        clazz="w-full h-48 object-contain"
      ></map-img>
      <slot></slot>
    </div>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { camelToKebab, slugify } from '~/lib/util'

export default defineComponent({
  props: {
    mode: {
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
    id: {
      type: [String, Number],
      required: true
    },
  },
  setup(props) {
    const mapPath = computed(() =>  `/tier-list/mode/${camelToKebab(props.mode)}/map/${slugify(props.map)}`)

    return {
      mapPath,
    }
  },
})
</script>
