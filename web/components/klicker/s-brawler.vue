<template>
  <b-select
    v-if="brawlers != undefined"
    v-model="brawler"
    dark
    sm
  >
    <option value="">{{ $t('option.any-brawler') }}</option>
    <option
      v-for="b in brawlers"
      :key="b.brawlstarsId"
      :value="b.brawlstarsId"
    >{{ b.name }}</option>
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
    const brawler = computed({
      get() {
        return (props.modelValue.brawler ?? [])[0] ?? ''
      },
      set(v: string) {
        props.onInput({ brawler: v == '' ? [] : [v] })
      }
    })

    return {
      brawler,
      brawlers,
    }
  },
})
</script>
