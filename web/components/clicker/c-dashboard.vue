<template>
  <div class="flex flex-wrap">
    <c-configurator
      :value="value"
      :config="config"
      class="flex-auto md:flex-none"
      full-height
      @input="v => $emit('input', v)"
    ></c-configurator>

    <c-slicer
      v-model="slices"
      :config="config"
      :cube-id="value.cubeId"
      full-height
    >
      <template v-slot:slices="data">
        <slot
          name="slices"
          v-bind="data"
        ></slot>
      </template>
    </c-slicer>

    <div class="self-center md:self-auto mr-auto">
      <div class="mx-2 my-2">
        <label class="flex items-center">
          <b-checkbox v-model="comparing"></b-checkbox>
          <span class="ml-2">Compare Mode</span>
        </label>
      </div>

      <c-slicer
        v-if="value.comparing"
        v-model="comparingSlices"
        :config="config"
        :cube-id="value.cubeId"
        comparing
        full-height
      >
        <template v-slot:slices="data">
          <slot
            name="slices"
            v-bind="data"
          ></slot>
        </template>
      </c-slicer>
    </div>

    <c-query
      :config="config"
      :dimensions-ids="value.dimensionsIds"
      :measurements-ids="value.measurementsIds"
      :slices-values="value.slices"
      :comparing-slices-values="value.comparingSlices"
      :cube-id="value.cubeId"
      :sort-id="value.measurementsIds[0]"
      :comparing="value.comparing"
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
    value: {
      type: Object as PropType<Configuration>,
      required: true
    },
    config: {
      type: Object as PropType<Record<string, Cube>>,
      required: true
    },
  },
  computed: {
    comparing: {
      get() {
        return this.value.comparing
      },
      set(c: boolean) {
        this.$emit('input', {
          ...this.value,
          comparing: c,
        })
      }
    },
    slices: {
      get() {
        return this.value.slices
      },
      set(v: SliceValue) {
        this.$emit('input', {
          ...this.value,
          slices: v,
        })
      }
    },
    comparingSlices: {
      get() {
        return this.value.comparingSlices
      },
      set(v: SliceValue) {
        this.$emit('input', {
          ...this.value,
          comparingSlices: v,
        })
      }
    },
  },
})
</script>
