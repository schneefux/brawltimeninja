<template>
  <b-card
    v-if="show"
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
import { computed, defineComponent, PropType, toRefs, useContext } from "@nuxtjs/composition-api"
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
    const { $klicker } = useContext()

    const measurements = computed(() => $klicker.getMeasurements(query.value.state))
    const title = computed(() => 'About ' + $klicker.getName(measurements[0]))
    const description = computed(() => measurements[0].description)

    const show = computed(() => query.value.state.measurementsIds.length == 1 && description != undefined)

    return {
      show,
      title,
      description,
    }
  },
})
</script>
