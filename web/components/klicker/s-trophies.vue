<template>
  <trophy-slider-select
    v-model="model"
    :name="(value.powerplay || [])[0] == 'true' ? 'playerLeague' : 'playerTrophies'"
  ></trophy-slider-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useRoute } from '@nuxtjs/composition-api'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    onInput: {
      type: Function as PropType<SliceValueUpdateListener>,
      required: true
    },
  },
  setup(props) {
    const model = computed({
      get() {
        return {
          gte: parseInt(props.value.trophyRangeGte?.[0] as string) || undefined,
          lt: parseInt(props.value.trophyRangeLt?.[0] as string) || undefined,
        }
      },
      set(v: { gte?: number, lt?: number }) {
        props.onInput({
          trophyRangeGte: v.gte != undefined ? [v.gte.toString()] : [],
          trophyRangeLt: v.lt != undefined ? [v.lt.toString()] : [],
        })
      }
    })

    return {
      model,
    }
  }
})
</script>
