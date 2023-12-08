<template>
  <router-link
    :to="to"
    class="flex items-center"
    @click.stop
  >
    <div class="mr-2 w-24 sm:w-23 md:w-40">
      <media-img
        :path="imgPath"
        :alt="row.dimensions.mode"
        size="160"
        clazz="h-6 sm:h-8 md:h-10"
      ></media-img>
    </div>
    <span
      v-if="captioned"
      class="w-16 md:w-24"
    >{{ row.dimensions.mode }}</span>
  </router-link>
</template>

<script lang="ts">
import { useLocalePath } from '~/composables/compat'
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
    const localePath = useLocalePath()
    const to = computed(() => localePath(`/tier-list/mode/${camelToKebab(props.row.dimensionsRaw.mode.mode)}`))
    const imgPath = computed(() => `/modes/${camelToKebab(props.row.dimensionsRaw.mode.mode)}/background`)

    return {
      to,
      imgPath,
    }
  },
})
</script>
