<template>
  <b-select
    v-if="brawlers != undefined"
    v-model="brawler"
    dark
    sm
  >
    <option value="">{{ $t('option.any-brawler') }}</option>
    <option
      v-for="b in brawlers"
      :key="b.id"
      :value="b.id"
    >{{ b.name }}</option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { capitalize } from '~/lib/util'
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
  },
  setup(props) {
    const { $klicker } = useContext()

    const brawlers = useAsync(async () => {
      const brawlers = await $klicker.queryAllBrawlers()
      return brawlers
        .sort((b1, b2) => b1.localeCompare(b2))
        .map(b => ({
          id: b,
          name: capitalize(b.toLowerCase()),
        }))
    }, 's-brawler-brawlers')

    const brawler = computed({
      get() {
        return (props.modelValue.brawler ?? [])[0] ?? ''
      },
      set(v: string) {
        props.onInput({ brawler: v == '' ? [] : [v] })
      }
    })

    return {
      brawler,
      brawlers,
    }
  },
})
</script>
