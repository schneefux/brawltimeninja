<template>
  <b-select
    v-if="seasonsSince.length > 0 && seasonsAt.length > 0"
    v-model="value"
    dark
    sm
  >
    <option
      v-for="s in seasonsSince"
      :key="`since@${s.id}`"
      :value="`since@${s.id}`"
    >
      {{ $t('option.season-since', { season: s.name }) }}
    </option>
    <option
      v-for="s in seasonsAt"
      :key="`at@${s.id}`"
      :value="`at@${s.id}`"
    >
      {{ $t('option.season-at', { season: s.name }) }}
    </option>
  </b-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { useAllSeasons } from '~/composables/dimension-values'

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
    limitSince: {
      type: Number,
      default: 8
    },
    limitAt: {
      type: Number,
      default: 52
    },
  },
  setup(props) {
    const seasons = useAllSeasons(Math.max(props.limitSince, props.limitAt))
    const seasonsSince = computed(() => seasons.value.slice(0, props.limitSince))
    const seasonsAt = computed(() => seasons.value.slice(0, props.limitAt))

    const value = computed({
      get() {
        // 'season' is always set, so check seasonAt for existence first as it takes precedence
        const seasonAt = (props.modelValue.seasonExact || [])[0]
        if (seasonAt != undefined) {
          return `at@${seasonAt}`
        }
        const seasonSince = (props.modelValue.season || [])[0]
        if (seasonSince != undefined) {
          return `since@${seasonSince}`
        }
        throw new Error('No season selected')
      },
      set(v: string) {
        const [operator, value] = v.split('@')
        if (operator == 'at') {
          props.onInput({ season: [value], seasonExact: [value] })
        }
        if (operator == 'since') {
          props.onInput({ season: [value], seasonExact: [] })
        }
      }
    })

    return {
      value,
      seasonsSince,
      seasonsAt,
    }
  },
})
</script>
