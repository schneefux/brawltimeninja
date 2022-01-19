<template>
  <b-select
    v-model="choice"
    dark
    sm
  >
    <option value="all">Include Competition Maps</option>
    <option value="include">Only Competition Maps</option>
    <option value="exclude">Exclude Competition Maps</option>
  </b-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { SliceValue, SliceValueUpdateListener } from '~/klicker'

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
    const choice = computed({
      get(): string {
        if (props.value.mapLike?.length == 1 && props.value.mapLike[0] == 'Competition') {
          return 'include'
        }
        if (props.value.mapNotLike?.length == 1 && props.value.mapNotLike[0] == 'Competition') {
          return 'exclude'
        }
        return 'all'
      },
      set(v: string) {
        if (v == 'include') {
          props.onInput({
            mapLike: ['Competition'],
            mapNotLike: [],
          })
        }
        if (v == 'exclude') {
          props.onInput({
            mapLike: [],
            mapNotLike: ['Competition'],
          })
        }
        if (v == 'all') {
          props.onInput({
            mapLike: [],
            mapNotLike: [],
          })
        }
      }
    })

    return {
      choice,
    }
  },
})
</script>
