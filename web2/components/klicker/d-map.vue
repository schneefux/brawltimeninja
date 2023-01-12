<template>
  <router-link
    :to="to"
    class="flex items-center"
  >
    <div class="mr-2 w-10 sm:w-12 md:w-14">
      <map-img
        :id="row.dimensionsRaw.map.eventId"
        :map="row.dimensionsRaw.map.map"
        clazz="h-6 sm:h-8 md:h-10"
      ></map-img>
    </div>
    <span
      v-if="captioned"
      class="w-16 md:w-24"
    >{{ row.dimensions.map }}</span>
  </router-link>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { camelToKebab } from '~/lib/util'

export default defineComponent({
  props: {
    row: {
      type: Object,
      required: true
    },
    captioned: {
      type: Boolean
    },
  },
  setup(props) {
    const to = computed(() => `/tier-list/mode/${camelToKebab(props.row.dimensionsRaw.map.mode || '')}/map/${props.row.dimensionsRaw.map.map}`)

    return {
      to,
    }
  },
})
</script>
