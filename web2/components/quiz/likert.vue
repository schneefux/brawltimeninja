<template>
  <ol :start="start">
    <li
      v-for="id in questions"
      :key="id"
      class="my-3"
    >
      <div class="flex justify-center items-center space-x-1 text-sm">
        <span class="!mr-2 flex-1 text-right">
          <slot name="low" :id="id"></slot>
        </span>
        <b-radio
          v-for="i in 5"
          :model-value="value[id]"
          :key="i"
          :value="i"
          :name="id"
          :class="{
            'w-6 h-6': (i == 1 || i == 5),
            'w-5 h-5': (i == 2 || i == 4),
            'w-4 h-4': (i == 3),
          }"
          required
          primary
          @update:modelValue="(v: any) => $emit('update:modelValue', { ...value, [id]: v })"
        ></b-radio>
        <span class="!ml-2 flex-1 text-left">
          <slot name="high" :id="id"></slot>
        </span>
      </div>
    </li>
  </ol>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<Record<string, number>>,
      required: true
    },
    questions: {
      type: Array as PropType<string[]>,
      required: true
    },
    start: {
      type: Number,
      required: true
    },
  },
})
</script>
