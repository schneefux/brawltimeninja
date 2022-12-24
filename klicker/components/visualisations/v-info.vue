<template>
  <v-card-wrapper
    v-if="description != undefined"
    v-bind="$props"
    :card="card && { ...card, title }"
    component="v-info"
  >
    <template v-slot:content>
      <p class="md:h-16">
        {{ description }}
      </p>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue"
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
    const { $klicker, metrics } = useCubeResponseProps(props)

    const title = computed(() => 'About ' + $klicker.getName(metrics.value[0]))
    const description = computed(() => metrics.value[0].description)

    return {
      title,
      description,
    }
  },
})
</script>
