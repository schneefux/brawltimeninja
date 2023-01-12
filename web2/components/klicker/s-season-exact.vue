<template>
  <b-select
    v-if="seasons != undefined"
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
import { defineComponent, PropType, watch, computed } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { useContext, useAsync } from '~/composables/compat'

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
    const { $klicker } = useContext()

    async function getSeasons(): Promise<{ id: string, name: string }[]> {
      return await $klicker.queryAllSeasons(props.limit)
    }

    const seasons = useAsync(() => getSeasons(), 's-season-exact-seasons')

    watch(() => props.limit, async () => seasons.value = await getSeasons())

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
