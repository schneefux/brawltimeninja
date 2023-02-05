<template>
  <b-select
    v-if="seasons.length > 0"
    v-model="value"
    dark
    sm
  >
    <option value="">
      {{ $t('option.any-season') }}
    </option>
    <option
      v-for="s in seasons"
      :key="s.id"
      :value="s.id"
    >
      {{ $t('option.season-at', { season: s.name }) }}
    </option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { useAllSeasons } from '@/composables/dimension-values'

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
    limit: {
      type: Number,
      default: 52
    },
  },
  setup(props) {
    const seasons = useAllSeasons(props.limit)

    const value = computed({
      get() {
        return (props.modelValue.seasonExact || [])[0] ?? ''
      },
      set(v: string) {
        props.onInput({ seasonExact: [v] })
      }
    })

    return {
      value,
      seasons,
    }
  },
})
</script>
