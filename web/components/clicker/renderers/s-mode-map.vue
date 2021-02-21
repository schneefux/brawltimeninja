<template>
  <div class="mr-2 my-1">
    <b-select
      v-model="mode"
      dark
      sm
    >
      <option value="">{{ $t('option.all-modes') }}</option>
      <option
        v-for="mode in modes"
        :key="mode"
        :value="mode"
      >{{ $t('mode.' + mode) }}</option>
    </b-select>

    <b-select
      v-show="mode != ''"
      v-model="map"
      dark
      sm
    >
      <option value="">{{ $t('option.all-maps') }}</option>
      <option
        v-for="map in maps"
        :key="map.battle_event_map"
        :value="map.battle_event_map"
      >{{ map.battle_event_id != 0 ? $t('map.' + map.battle_event_id) : map.battle_event_map }}</option>
    </b-select>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  data() {
    return {
      maps: [] as { battle_event_map: string, battle_event_id: number }[],
      modes: [] as string[],
    }
  },
  watch: {
    mode: '$fetch',
    '$i18n.loale': '$fetch',
  },
  async fetch() {
    this.modes = await this.$clicker.queryAllModes()
    const maps = await this.$clicker.queryAllMaps(this.mode == '' ? undefined : this.mode)
    this.maps = maps.sort((m1, m2) => (this.$i18n.t('map.' + m1.battle_event_id) as string).localeCompare(this.$i18n.t('map.' + m2.battle_event_id) as string))
  },
  computed: {
    mode: {
      get(): string {
        return (this.value.mode || {})[0]
      },
      set(v: string) {
        this.$parent.$emit('input', {
          ...this.value,
          mode: v != '' ? [v] : [],
          map: [],
        })
      },
    },
    map: {
      get(): string {
        return (this.value.map || {})[0]
      },
      set(v: string) {
        this.$parent.$emit('input', {
          ...this.value,
          map: v != '' ? [v] : [],
        })
      },
    },
  },
})
</script>
