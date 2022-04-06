<template>
  <div class="contents">
    <b-select
      v-if="modes != undefined"
      v-model="mode"
      dark
      sm
      @input="/*v => onInput({ map: [v], mode: [mode] })*/"
    >
      <option value="">{{ $t('option.all-modes') }}</option>
      <option
        v-for="mode in modes"
        :key="mode"
        :value="mode"
      >{{ $t('mode.' + mode) }}</option>
    </b-select>

    <b-select
      v-if="maps != undefined"
      v-model="map"
      :class="{ 'hidden': mode == undefined }"
      dark
      sm
      @input="/*v => onInput({ map: [map], mode: [v] })*/"
    >
      <option value="">{{ $t('option.all-maps') }}</option>
      <option
        v-for="map in maps"
        :key="map.battle_event_map"
        :value="map.battle_event_map"
      >{{ mapName(map.battle_event_id, map.battle_event_map) }}</option>
    </b-select>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useAsync, useContext, watch } from '@nuxtjs/composition-api'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { getMapName } from '~/composables/map'

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
    const { $klicker, i18n } = useContext()

    const mode = computed({
      get(): string {
        return (props.value.mode || {})[0] || ''
      },
      set(v: string) {
        props.onInput({
          mode: v != '' ? [v] : [],
          map: [],
        })
      },
    })

    const map = computed({
      get(): string {
        return (props.value.map || {})[0] || ''
      },
      set(v: string) {
        props.onInput({
          map: v != '' ? [v] : [],
        })
      },
    })

    async function getMaps(): Promise<{ battle_event_map: string, battle_event_id: number }[]> {
      const maps = await $klicker.queryAllMaps(mode.value == '' ? undefined : mode.value)
      return maps.sort((m1, m2) => (i18n.t('map.' + m1.battle_event_id) as string).localeCompare(i18n.t('map.' + m2.battle_event_id) as string))
    }

    const maps = useAsync(() => getMaps())
    const modes = useAsync(() => $klicker.queryAllModes())

    watch(() => [props.value, i18n.locale], async () => maps.value = await getMaps())

    const mapName = (id: string, map: string) => getMapName(i18n, id, map)

    return {
      mapName,
      mode,
      map,
      modes,
      maps,
    }
  },
})
</script>
