<template>
  <dl>
    <div
      v-for="[key, value] in data"
      :key="key"
      class="flex justify-between"
    >
      <dt class="mr-2">{{ key }}</dt>
      <dd>{{ value }}</dd>
    </div>
  </dl>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<string[][]>,
    },
  },
})
</script>
