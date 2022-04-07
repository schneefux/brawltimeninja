<template>
  <b-fake-select>
    <template v-slot:preview>
      {{ formattedValue }}
    </template>

    <client-only>
      <div class="mt-10 w-56 px-4 pt-1">
        <season-slider
          :value="value"
          @input="e => $emit('input', e)"
        ></season-slider>
      </div>
    </client-only>
  </b-fake-select>
</template>

<script lang="ts">
import { format, parseISO } from 'date-fns'
import Vue from 'vue'
import { BFakeSelect } from '@schneefux/klicker/components'

export default Vue.extend({
  components: {
    BFakeSelect,
  },
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
