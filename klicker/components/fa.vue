<template>
  <svg
    v-show="i[4]"
    :viewBox="`0 0 ${i[0]} ${i[1]}`"
    class="fa"
    aria-hidden="true"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      v-if="i[4]"
      :transform="`translate(${i[0] / 2} ${i[1] / 2})`"
      :transform-origin="`${i[0] / 4} 0`"
    >
      <g>
        <path
          v-if="typeof i[4] === 'string'"
          :d="i[4]"
          :transform="`translate(${i[0] / -2} ${i[1] / -2})`"
          fill="currentColor"
        />
        <template v-else>
          <path
            :d="i[4][0]"
            :transform="`translate(${i[0] / -2} ${i[1] / -2})`"
            fill="currentColor"
          />
          <path
            :d="i[4][1]"
            :transform="`translate(${i[0] / -2} ${i[1] / -2})`"
            fill="currentColor"
          />
        </template>
      </g>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

/**
 * Lightweight FontAwesome component based on
 * https://github.com/Cweili/vue-fa
 */
export default defineComponent({
  props: {
    icon: {
      type: Object as PropType<IconDefinition>,
      required: true,
    },
  },

  setup(props) {
    const i = computed(() => props.icon?.icon ?? [0, 0, '', [], ''])

    return {
      i,
    };
  },
});
</script>

<style scoped>
.fa {
  display: inline;
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
</style>
