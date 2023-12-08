<template>
  <b-select
    v-if="brawlers != undefined"
    v-model="ally"
    dark
    sm
  >
    <option value="">with any</option>
    <option
      v-for="b in brawlers"
      :key="b.id"
      :value="b.id"
    >with {{ b.name }}</option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { useAllBrawlers } from '~/composables/dimension-values'

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    onInput: {
      type: Function as PropType<SliceValueUpdateListener>,
      required: true
    },
  },
  setup(props) {
    const brawlers = useAllBrawlers()
    const ally = computed({
      get() {
        return (props.modelValue.ally ?? [])[0] ?? ''
      },
      set(v: string) {
        props.onInput({ ally: v == '' ? [] : [v] })
      }
    })

    return {
      brawlers,
      ally,
    }
  },
})
</script>
