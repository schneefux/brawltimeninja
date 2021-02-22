<template>
  <div class="flex flex-wrap justify-center">
    <c-configurator
      v-model="configuration"
      :config="config"
      class="w-full"
    ></c-configurator>

    <div
      v-if="config[configuration.cubeId].slices.length > 0"
      class="w-full flex"
    >
      <c-slicer
        v-model="configuration.slices"
        :config="config"
        :cube-id="configuration.cubeId"
        :comparing="false"
        class="w-full"
      >
        <template v-slot:slices="data">
          <slot
            name="slices"
            v-bind="data"
          ></slot>
        </template>
      </c-slicer>

      <div class="self-center mx-2">
        <b-button
          @click="comparing = !comparing"
          primary
          md
        >Compare</b-button>
      </div>
    </div>

    <c-slicer
      v-if="comparing"
      v-model="configuration.comparingSlices"
      :config="config"
      :cube-id="configuration.cubeId"
      :comparing="true"
      class="w-full"
    >
      <template v-slot:slices="data">
        <slot
          name="slices"
          v-bind="data"
        ></slot>
      </template>
    </c-slicer>

    <c-query
      :config="config"
      :dimensions-ids="configuration.dimensionsIds"
      :measurements-ids="configuration.measurementsIds"
      :slices-values="configuration.slices"
      :comparing-slices-values="configuration.comparingSlices"
      :cube-id="configuration.cubeId"
      :sort-id="configuration.measurementsIds[0]"
      :comparing="comparing"
    >
      <template v-slot="data">
        <v-dashboard v-bind="data">
          <template v-slot:dimensions="data">
            <slot
              name="dimensions"
              v-bind="data"
            ></slot>
          </template>
          <template v-slot:measurements="data">
            <slot
              name="measurements"
              v-bind="data"
            ></slot>
          </template>
          <template v-slot:visualisations="data">
            <slot
              name="visualisations"
              v-bind="data"
            ></slot>
          </template>
        </v-dashboard>
      </template>
    </c-query>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Cube, SliceValue } from '~/lib/cube'
import CDashboard from './c-dashboard.vue'
import CSlicer from './c-slicer.vue'
import CConfigurator, { Configuration } from './c-configurator.vue'

export default Vue.extend({
  components: {
    CDashboard,
    CSlicer,
    CConfigurator,
  },
  props: {
    config: {
      type: Object as PropType<Record<string, Cube>>,
      required: true
    },
    defaultCube: {
      type: String,
      required: true
    },
    defaultSlices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    defaultMeasurements: {
      type: Array as PropType<string[]>,
      required: true
    },
    defaultDimensions: {
      type: Array as PropType<string[]>,
      required: true
    },
  },
  data() {
    const cubeId = this.defaultCube || 'map'
    return {
      configuration: {
        cubeId,
        slices: this.defaultSlices || this.config[cubeId].defaultSliceValues,
        comparingSlices: this.config[cubeId].defaultSliceValues,
        dimensionsIds: this.defaultDimensions || this.config[cubeId].defaultDimensionsIds,
        measurementsIds: this.defaultMeasurements || [this.config[cubeId].defaultMeasurementId],
      } as Configuration,
      comparing: false,
    }
  },
})
</script>

<style lang="postcss" scoped>
.top-12 {
  top: 3rem;
}

@responsive {
  .top-0\! {
    @apply top-0 !important;
  }
}
</style>
