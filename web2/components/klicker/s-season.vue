<template>
  <b-select
    v-if="seasons.length > 0"
    v-model="value"
    dark
    sm
  >
    <option
      v-for="s in seasons"
      :key="s.id"
      :value="s.id"
    >
      {{ $t('option.season-since', { season: s.name }) }}
    </option>
  </b-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
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
      default: 8
    },
  },
  setup(props) {
    const seasons = useAllSeasons(props.limit)

    const value = computed({
      get() {
        const season = (props.modelValue.season || [])[0]
        if (season == undefined) {
          throw new Error('No season selected')
        }
        return season
      },
      set(v: string) {
        props.onInput({ season: [v] })
      }
    })

    return {
      value,
      seasons,
    }
  },
})
</script>
