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
import { computed, defineComponent, PropType, useContext } from "@nuxtjs/composition-api"
import { CubeResponse } from "~/klicker"
import { useCubeResponse } from "~/klicker/composables/response"

export default defineComponent({
  props: {
    response: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { $klicker, measurements } = useCubeResponse(props)

    const title = computed(() => 'About ' + $klicker.getName(measurements[0]))
    const description = computed(() => measurements[0].description)

    const show = computed(() => props.response.query.measurementsIds.length == 1 && description != undefined)

    return {
      show,
      title,
      description,
    }
  },
})
</script>
