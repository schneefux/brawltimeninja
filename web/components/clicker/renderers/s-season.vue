<template>
  <div
    v-if="'season' in value"
    class="mr-2 my-1"
  >
    <b-select
      v-if="seasons.length > 3"
      :value="value.season[0]"
      dark
      sm
      @input="v => $parent.$emit('slice', { season: [v] })"
    >
      <option value="current">
        Since {{ seasons[0].name }}
      </option>
      <option
        :key="seasons[1].id"
        :value="seasons[1].id"
      >
        Since {{ seasons[1].name }}
      </option>
      <option value="month">
        Since {{ seasons[2].name }}
      </option>
      <option
        v-for="s in seasons.slice(3)"
        :key="s.id"
        :value="s.id"
      >
        Since {{ s.name }}
      </option>
    </b-select>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'
import { format, parseISO, subWeeks } from 'date-fns'
import { formatClickhouse } from '~/lib/util'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  data() {
    return {
      seasons: [] as { id: string, name: string }[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const limit = subWeeks(new Date(), 8)

    const data = await this.$clicker.query('seasons.all', 'map',
      ['trophy_season_end'],
      ['trophy_season_end', 'picks'], {
        trophy_season_end: [formatClickhouse(limit)],
      }, {
        cache: 60*60*24,
      })

    this.seasons = data.data
      .map(e => {
        const d = parseISO(e.trophy_season_end)
        return {
          id: formatClickhouse(d),
          name: format(subWeeks(d, 2), 'PP') // seasons last 2 weeks
        }
      })
      .sort((e1, e2) => e1.id.localeCompare(e2.id))
      .reverse()
  },
})
</script>
