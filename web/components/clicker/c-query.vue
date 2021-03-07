<template>
  <div class="contents">
    <slot
      v-if="result == undefined"
      name="placeholder"
    ></slot>
    <slot
      v-if="result != undefined"
      :state="state"
      :comparing="state.comparing"
      :loading="loading"
      :data="result.data"
      :dimensions="result.dimensions"
      :measurements="result.measurements"
      v-bind="$attrs"
    ></slot>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { State } from '~/lib/cube'
import { CubeResponse } from '~/plugins/cube'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    state: {
      type: Object as PropType<State>,
      required: true
    },
    limit: {
      type: Number
    },
    includeMeta: {
      type: Boolean
    },
  },
  data() {
    return {
      loading: false,
      result: undefined as undefined|CubeResponse,
    }
  },
  watch: {
    state: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    this.loading = true
    this.result = await this.$cube.query(this.state, this.limit, this.includeMeta)
    this.loading = false
  },
})
</script>
