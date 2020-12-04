<template functional>
  <dl
    v-bind="data.attrs"
    :class="[data.class, data.staticClass]"
    :style="data.staticStyle"
  >
    <div
      v-for="[key, value] in props.data"
      :key="key"
      class="flex justify-between"
    >
      <dt class="font-semibold mr-2">{{ key }}</dt>
      <dd>{{ value }}</dd>
    </div>
  </dl>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    data: {
      type: Array as PropType<string[][]>,
    },
  },
})
</script>
