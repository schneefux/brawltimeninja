<template>
  <dl class="flex flex-col md:flex-row md:flex-wrap md:justify-center gap-y-2 gap-x-8">
    <b-card
      v-for="(value, name) in stats"
      :key="name"
      :elevation="elevation"
      dense
    >
      <div
        slot="content"
        class="text-lg flex"
      >
        <dd class="text-yellow-400 w-16 md:w-auto text-right">{{ value }}</dd>
        <dt class="ml-2 w-full overflow-hidden">{{ $t('metric.' + name) }}</dt>
      </div>
    </b-card>
  </dl>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    stats: {
      type: Object as PropType<Record<string, number>>,
      required: true,
    },
    elevation: {
      type: Number,
      default: 2
    },
  },
})
</script>
