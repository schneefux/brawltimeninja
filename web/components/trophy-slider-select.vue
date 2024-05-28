<template>
  <range-slider-select
    v-model="value"
    :name="name == 'playerTrophies' ? $t('metric.playerTrophies') : ''"
    :min="min"
    :max="max"
    :format="format"
  ></range-slider-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { formatLeagueRanks } from '~/lib/util'

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<{ gte?: number, lte?: number }>,
      required: true,
    },
    name: {
      type: String as PropType<'playerTrophies'|'playerLeague'>,
      default: 'playerTrophies'
    },
  },
  emits: {
    ['update:modelValue'](value: { gte?: number, lte?: number }) { return true },
  },
  setup(props, { emit }) {
    const format = computed(() => {
      if (props.name == 'playerLeague') {
        return (n?: number) => n == undefined ? '' : formatLeagueRanks(n).formatted
      } else {
        return (n?: number) => n == undefined ? '' : n * 100 + (n == max.value ? '+' : '')
      }
    })

    const min = computed(() => props.name == 'playerTrophies' ? 0 : 1)
    const max = computed(() => props.name == 'playerTrophies' ? 15 : 19)

    const value = computed({
      get() {
        const gte = props.modelValue.gte || min.value
        const lte = props.modelValue.lte || max.value
        return [gte, lte]
      },
      set(e: number[]) {
        const gte = e[0] > min.value ? { gte: e[0] } : {}
        const lte = e[1] < max.value ? { lte: e[1] } : {}

        emit('update:modelValue', {
          ...gte,
          ...lte,
        })
      }
    })

    return {
      min,
      max,
      format,
      value,
    }
  },
})
</script>
