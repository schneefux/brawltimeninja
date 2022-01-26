<template>
  <b-select
    v-if="brawlers != undefined"
    :value="value.brawler || ''"
    dark
    sm
    @input="v => onInput({ brawler: v == '' ? [] : [v] })"
  >
    <option
      value=""
    >Any Brawler</option>
    <option
      v-for="b in brawlers"
      :key="b.id"
      :value="b.id"
    >{{ b.name }}</option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType, useAsync, useContext } from '@nuxtjs/composition-api'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { capitalize } from '~/lib/util'

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
  setup() {
    const { $klicker } = useContext()

    const brawlers = useAsync(async () => {
      const brawlers = await $klicker.queryAllBrawlers()
      return brawlers
        .sort((b1, b2) => b1.localeCompare(b2))
        .map(b => ({
          id: b,
          name: capitalize(b.toLowerCase()),
        }))
    })

    return {
      brawlers,
    }
  },
})
</script>
