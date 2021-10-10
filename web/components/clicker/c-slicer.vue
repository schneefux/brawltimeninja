<template>
  <card v-bind="$attrs">
    <div slot="content" class="mb-1">
      <b-button
        :selected="showFilters"
        class="mr-3 my-2 md:hidden"
        primary
        sm
        @click="showFilters = !showFilters"
      >
        <font-awesome-icon
          :icon="faFilter"
        ></font-awesome-icon>

        Configure {{ comparing ? 'Comparing ' : '' }} Filters
      </b-button>

      <div
        :class="['md:block', {
          'hidden': !showFilters,
          'mt-3': showFilters,
        }]"
      >
        <h1 class="text-xl font-semibold hidden md:block my-1 mr-4">{{ comparing ? 'Compare to' : 'Filters' }}</h1>
        <div class="mb-3 flex flex-col md:flex-row flex-wrap gap-x-2 gap-y-2">
          <slot :value="slices"></slot>
        </div>
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import Vue, { PropType } from 'vue'
import { SliceValue, State } from '~/lib/cube'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<State>,
      required: true
    },
    comparing: {
      // true if the slicer controls comparingSlices
      type: Boolean
    },
  },
  data() {
    return {
      showFilters: false,
    }
  },
  mounted() {
    // slots cannot have event handlers, so they $parent.$emit
    // the diff object instead
    // capture, process and forward it
    this.$on('slice', (s: Partial<SliceValue>) => {
      this.$emit('input', <State>{
        ...this.value,
        [this.comparing ? 'comparingSlices' : 'slices']: {
          ...this.slices,
          ...s,
        },
      })
    })
  },
  computed: {
    slices(): SliceValue {
      return this.value.comparingSlices ?? this.value.slices
    },
    faFilter() {
      return faFilter
    },
  },
})
</script>
