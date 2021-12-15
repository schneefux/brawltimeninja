<template>
  <b-select
    v-if="key in value && seasons != undefined"
    :value="value[key][0]"
    dark
    sm
    @input="v => onInput({ [key]: [v] })"
  >
    <option
      v-for="s in seasons"
      :key="s.id"
      :value="s.id"
    >
      {{ exact ? 'At' : 'Since' }} {{ s.name }}
    </option>
  </b-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useAsync, useContext, watch } from '@nuxtjs/composition-api'
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
    exact: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 8
    },
  },
  setup(props) {
    const { $klicker } = useContext()

    const key = computed(() => props.exact != false ?  'seasonExact' : 'season')

    async function getSeasons(): Promise<{ id: string, name: string }[]> {
      return await $klicker.queryAllSeasons(props.limit)
    }

    const seasons = useAsync(() => getSeasons())

    watch(() => props.limit, async () => seasons.value = await getSeasons())

    return {
      key,
      seasons,
    }
  },
})
</script>
