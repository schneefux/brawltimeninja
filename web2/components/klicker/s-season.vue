<template>
  <b-select
    v-if="seasons != undefined"
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
import { computed, defineComponent, PropType, watch } from 'vue'
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
      default: 8
    },
  },
  setup(props) {
    const { $klicker } = useContext()

    async function getSeasons(): Promise<{ id: string, name: string }[]> {
      return await $klicker.queryAllSeasons(props.limit)
    }

    const seasons = useAsync(() => getSeasons(), 's-season-seasons')

    watch(() => props.limit, async () => seasons.value = await getSeasons())

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
