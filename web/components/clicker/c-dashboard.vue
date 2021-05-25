<template>
  <div class="flex flex-wrap">
    <c-configurator
      v-model="state"
      class="flex-auto md:flex-none"
      full-height
    ></c-configurator>

    <c-slicer
      v-model="state"
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
      include-meta
    >
      <template v-slot="data">
        <client-only>
          <!-- FIXME SSR error -->
          <v-dashboard v-bind="data">
            <template
              v-for="(_, name) in $scopedSlots"
              v-slot:[name]="data"
            >
              <slot
                v-if="name == 'dimensions' || name == 'visualisations' || name.startsWith('measurements.')"
                :name="name"
                v-bind="data"
              ></slot>
            </template>
          </v-dashboard>
        </client-only>
      </template>
    </c-query>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue, State } from '~/lib/cube'
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
