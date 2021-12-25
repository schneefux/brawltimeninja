<template>
  <b-card
    v-if="applicable && description != undefined"
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
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api"
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
    const { $klicker, measurements, applicable } = useCubeResponse('v-info', props)

    const title = computed(() => 'About ' + $klicker.getName(measurements[0]))
    const description = computed(() => measurements[0].description)

    return {
      applicable,
      title,
      description,
    }
  },
})
</script>
