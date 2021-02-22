<template>
  <card v-bind="$attrs">
    <template v-slot:content>
      <div class="flex md:hidden">
        <b-button
          :selected="showFilters"
          primary
          sm
          class="mr-3 h-8"
          @click="showFilters = !showFilters"
        >
          <font-awesome-icon
            :icon="faFilter"
          ></font-awesome-icon>

          Filters
        </b-button>
      </div>

      <div
        :class="['md:flex flex-wrap', {
          'hidden': !showFilters,
          'mt-3': showFilters,
        }]"
      >
        <h1 class="text-xl font-semibold hidden md:inline my-1 mr-4">{{ comparing ? 'Compare to' : 'Filters' }}</h1>
        <slot
          name="slices"
          :value="value"
        ></slot>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    comparing: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      showFilters: false,
    }
  },
  computed: {
    faFilter() {
      return faFilter
    },
  },
})
</script>
