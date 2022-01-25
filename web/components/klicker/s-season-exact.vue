<template>
  <b-select
    v-if="seasons != undefined"
    :value="(value.seasonExact || [])[0]"
    dark
    sm
    @input="v => onInput({ seasonExact: [v] })"
  >
    <option
      value=""
    >
      Any Season
    </option>
    <option
      v-for="s in seasons"
      :key="s.id"
      :value="s.id"
    >
      At {{ s.name }}
    </option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType, useAsync, useContext, watch } from '@nuxtjs/composition-api'
import { SliceValue, SliceValueUpdateListener } from 'klicker/types'

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

    const seasons = useAsync(() => getSeasons())

    watch(() => props.limit, async () => seasons.value = await getSeasons())

    return {
      seasons,
    }
  },
})
</script>
