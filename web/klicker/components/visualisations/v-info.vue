<template>
  <v-card-wrapper
    v-if="description != undefined"
    v-bind="$props"
    :card="card && { ...card, title, dense: true }"
    component="v-info"
  >
    <p
      slot="content"
      class="md:h-16"
    >
      {{ description }}
    </p>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from "@nuxtjs/composition-api"
import { VisualisationProps } from "~/klicker/props"
import { useCubeResponse } from "~/klicker/composables/response"
import VCardWrapper from '~/klicker/components/visualisations/v-card-wrapper.vue'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, measurements } = useCubeResponse(props)

    const title = computed(() => 'About ' + $klicker.getName(measurements.value[0]))
    const description = computed(() => measurements.value[0].description)

    return {
      title,
      description,
    }
  },
})
</script>
