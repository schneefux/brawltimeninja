<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
    v-bind="$attrs"
    md
  >
    <div
      v-if="powerplay || id == 0 || endDate != undefined || startDate != undefined"
      slot="infobar"
      class="flex justify-end"
    >
      <span v-if="id == 0 && map.startsWith('Competition Entry')" class="mr-auto">
        {{ $tc('competition-map', 1) }}
      </span>
      <span v-if="id == 0 && map.startsWith('Competition Winner')" class="mr-auto">
        {{ $tc('competition-winner', 1) }}
      </span>
      <span v-if="powerplay" class="mr-auto">
        {{ $tc('power-play', 1) }}
      </span>
      <span v-if="endDate != undefined">
        {{ endDateString }}
      </span>
      <span v-if="startDate != undefined">
        {{ startDateString }}
      </span>
    </div>

    <map-best-brawlers
      slot="content"
      :slices="slices"
      :elevation="2"
    ></map-best-brawlers>

    <b-button
      v-if="link"
      slot="actions"
      :to="link"
      primary
      prefetch
      sm
    >
      {{ $t('action.open') }}
    </b-button>
  </event-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { camelToKebab, slugify } from '@/lib/util'
import { parseISO, formatDistanceToNow } from 'date-fns'
import { SliceValue } from 'klicker/types'

import { enUS, de, es } from 'date-fns/locale'
const locales = { en: enUS, de, es }

export default Vue.extend({
  props: {
    endDate: {
      type: String,
    },
    startDate: {
      type: String,
    },
    id: {
      type: [Number, String],
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  computed: {
    mode(): string|undefined {
      return this.slices.mode?.[0]
    },
    map(): string|undefined {
      return this.slices.map?.[0]
    },
    powerplay(): boolean {
      return this.slices.powerplay?.[0] == 'true'
    },
    link(): string|undefined {
      if (this.mode == undefined) {
        return undefined
      }
      if (this.map != undefined) {
        return this.localePath(`/tier-list/mode/${camelToKebab(this.mode)}/map/${slugify(this.map)}`)
      } else {
        return this.localePath(`/tier-list/mode/${camelToKebab(this.mode)}`)
      }
    },
    endDateString(): string {
      if (this.endDate == undefined) {
        return ''
      }

      const date = parseISO(this.endDate)
      const dist = formatDistanceToNow(date, {
        locale: locales[this.$i18n.locale],
      })

      return this.$t('time.ends-in', { time: dist }) as string
    },
    startDateString(): string {
      if (this.startDate == undefined) {
        return ''
      }

      const date = parseISO(this.startDate)
      return 'starts in ' + formatDistanceToNow(date)
    },
  },
})
</script>
