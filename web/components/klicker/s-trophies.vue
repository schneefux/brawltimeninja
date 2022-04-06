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
    let trophyRangeGte;
    let trophyRangeLt;

    const { trophies } = useRoute().value.query;
    if (trophies && typeof trophies === 'string') {
      // TODO: Move to dashboard?
      [trophyRangeGte, trophyRangeLt] = trophies.split('-').map(t => Number(t) / 100);
    }

    const model = computed({
      get() {
        const gte = trophyRangeGte ?? props.value.trophyRangeGte?.[0] ?? undefined
        const lt = trophyRangeLt ?? props.value.trophyRangeLt?.[0] ?? undefined

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
