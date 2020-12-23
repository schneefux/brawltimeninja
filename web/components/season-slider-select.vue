<template>
  <fake-select>
    <template v-slot:preview>
      {{ formattedValue }}
    </template>

    <client-only>
      <season-slider
        :value="value"
        @input="e => $emit('input', e)"
        class="mt-10"
      ></season-slider>
    </client-only>
  </fake-select>
</template>

<script lang="ts">
import { format, parseISO } from 'date-fns'
import Vue from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  computed: {
    formattedValue(): string {
      if (this.value == undefined) {
        return 'Any date'
      }
      return 'Season ' + format(parseISO(this.value), 'PP')
    },
  },
})
</script>
