<template>
  <div class="flex flex-wrap">
    <c-configurator
      v-model="state"
      :config="config"
      class="flex-auto md:flex-none"
      full-height
    ></c-configurator>

    <c-slicer
      v-model="state"
      :config="config"
      class="w-full md:w-auto"
      full-height
    >
      <template v-slot:slices="data">
        <slot
          name="slices"
          v-bind="data"
        ></slot>
      </template>
    </c-slicer>

    <c-slicer
      v-if="value.comparing"
      v-model="state"
      :config="config"
      class="w-full md:w-auto"
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

    <c-query
      :state="value"
      :config="config"
    >
      <template v-slot="data">
        <v-dashboard v-bind="data">
          <template v-slot:dimensions="data">
            <slot
              name="dimensions"
              v-bind="data"
            ></slot>
          </template>
          <template
            v-for="(_, name) in $scopedSlots"
            v-slot:[name]="data"
          >
            <slot
              v-if="name.startsWith('measurements.')"
              :name="name"
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
import { Cube, SliceValue, State } from '~/lib/cube'
import CDashboard from './c-dashboard.vue'
import CSlicer from './c-slicer.vue'
import CConfigurator from './c-configurator.vue'

export default Vue.extend({
  components: {
    CDashboard,
    CSlicer,
    CConfigurator,
  },
  props: {
    value: {
      type: Object as PropType<State>,
      required: true
    },
    config: {
      type: Object as PropType<Record<string, Cube>>,
      required: true
    },
  },
  computed: {
    state: {
      get(): State {
        return this.value
      },
      set(s: State) {
        this.$emit('input', s)
      }
    },
    comparing: {
      get(): boolean {
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
      get(): SliceValue {
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
      get(): SliceValue {
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
