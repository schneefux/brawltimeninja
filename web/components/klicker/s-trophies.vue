<template>
  <trophy-slider-select
    v-model="model"
    :name="isPowerplay ? 'playerLeague' : 'brawlerTrophies'"
  ></trophy-slider-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'

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
    const isPowerplay = computed(() => {
      return (props.modelValue.powerplay || [])[0] == 'true'
    })

    const model = computed({
      get() {
        return {
          gte: parseInt(props.modelValue.trophyRangeGte?.[0] as string) || undefined,
          lte: parseInt(props.modelValue.trophyRangeLte?.[0] as string) || undefined,
        }
      },
      set(v: { gte?: number, lte?: number }) {
        props.onInput({
          trophyRangeGte: v.gte != undefined ? [v.gte.toString()] : [],
          trophyRangeLte: v.lte != undefined ? [v.lte.toString()] : [],
        })
      }
    })

    return {
      isPowerplay,
      model,
    }
  }
})
</script>
