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
import { computed, defineComponent } from "vue-demi"
import { VisualisationProps } from "../../props"
import { useCubeResponseProps } from "../../composables/response"
import VCardWrapper from './v-card-wrapper.vue'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, measurements } = useCubeResponseProps(props)

    const title = computed(() => 'About ' + $klicker.getName(measurements.value[0]))
    const description = computed(() => measurements.value[0].description)

    return {
      title,
      description,
    }
  },
})
</script>
