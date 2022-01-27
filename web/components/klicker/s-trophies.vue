<template>
  <trophy-slider-select
    v-model="model"
    :name="(value.powerplay || [])[0] == 'true' ? 'playerLeague' : 'playerTrophies'"
  ></trophy-slider-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
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
        const gte = props.value.trophyRangeGte != undefined ? props.value.trophyRangeGte[0] : undefined
        const lt = props.value.trophyRangeLt != undefined ? props.value.trophyRangeLt[0] : undefined

        return {
          gte: gte != undefined ? parseInt(gte) : undefined,
          lt: lt != undefined ? parseInt(lt) : undefined,
        }
      },
      set(v: { gte: number|undefined, lt: number|undefined }) {
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
