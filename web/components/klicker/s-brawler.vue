<template>
  <b-select
    v-if="'brawler' in value"
    :value="value.brawler"
    dark
    sm
    @input="v => $parent.$emit('slice', { brawler: v == '' ? [] : [v] })"
  >
    <option
      value=""
    >Any Brawler</option>
    <option
      v-for="b in brawlers"
      :key="b"
      :value="b"
    >{{ capitalize(b.toLowerCase()) }}</option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, useContext, useFetch } from '@nuxtjs/composition-api'
import { PropType, ref } from '@vue/composition-api'
import { SliceValue } from '~/klicker'
import { capitalize } from '~/lib/util'

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  setup() {
    const { $klicker } = useContext()

    const brawlers = ref<string[]>([])

    useFetch(async () => {
      const data = await $klicker.queryAllBrawlers()
      brawlers.value = data.sort((b1, b2) => b1.localeCompare(b2))
    })

    return {
      brawlers,
      capitalize,
    }
  },
})
</script>
