<template>
  <b-card
    v-if="query.measurements.length == 1"
    :title="title"
    dense
  >
    <p
      slot="content"
      class="md:h-16"
    >
      {{ description }}
    </p>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from "@nuxtjs/composition-api"
import { CubeResponse } from "~/klicker"

export default defineComponent({
  props: {
    query: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { query } = toRefs(props)

    const title = computed(() => 'About ' + query.value.measurements[0].name)
    const description = computed(() => query.value.measurements[0].description)

    return {
      title,
      description,
    }
  },
})
</script>
