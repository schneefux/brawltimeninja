<template>
  <range-slider-select
    :value="values"
    :name="name == 'playerTrophies' ? $t('metric.playerTrophies') : ''"
    :max="max"
    :format="format"
    @input="onInput"
  ></range-slider-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<{ gte: number|undefined, lt: number|undefined }>,
      required: true,
    },
    name: {
      type: String as PropType<'playerTrophies'|'playerLeague'>,
      default: 'playerTrophies'
    },
  },
  setup(props, { emit }) {
    const format = computed(() => {
      if (props.name == 'playerLeague') {
        const leagues = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Mythic', 'Legendary', 'Masters']
        return (n: number) => `${leagues[Math.floor(n/3)]} ${n < max.value ? ['I', 'II', 'III'][n%3] : ''}`
      } else {
        return (n: number) => n * 100 + (n == max.value ? '+' : '')
      }
    })

    const max = computed(() => props.name == 'playerTrophies' ? 15 : 18)
    const values = computed(() => {
      const gte = props.value.gte || 0
      const lt = props.value.lt || max.value
      return [gte, lt]
    })

    const onInput = (e: number[]) => {
      const gte = e[0] > 0 ? { gte: e[0] } : {}
      const lt = e[1] < max.value ? { lt: e[1] } : {}

      emit('input', {
        ...gte,
        ...lt,
      })
    }

    return {
      max,
      format,
      values,
      onInput,
    }
  },
})
</script>
