<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-tier-list"
  >
    <ul slot="content">
      <li
        v-for="(entries, tier) in tiers"
        :key="tier"
        class="my-4 flex"
      >
        <div class="w-6 mr-3 flex justify-center items-center">
          <span class="text-2xl sm:text-2xl md:text-3xl font-bold">{{ tier }}</span>
        </div>
        <ul class="w-full flex flex-wrap justify-start items-center">
          <li
            v-for="entry in entries"
            :key="entry.id"
            class="my-px"
          >
            <slot
              name="dimensions"
              :row="entry"
            ></slot>
          </li>
        </ul>
      </li>
    </ul>
  </v-card-wrapper>
</template>

<script lang="ts">
import { Measurement, MetaGridEntry } from '../../types'
import { VisualisationProps } from '../../props'
import BCard from '../ui/b-card.vue'
import { scaleEntriesIntoTiers } from '../../util'
import { computed } from 'vue-demi'
import { defineComponent } from 'vue-demi'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'

export interface TierList {
  [tier: string]: MetaGridEntry[]
}

function groupTiers(entries: MetaGridEntry[], m: Measurement): TierList {
  if (entries.length <= 2) {
    return {}
  }

  const scaledEntries = scaleEntriesIntoTiers(entries, m)

  const tierMap = { S: [], A: [], B: [], C: [], D: [] } as Record<string, MetaGridEntry[]>
  scaledEntries.forEach(e => e.tier in tierMap ? tierMap[e.tier].push(e) : tierMap[e.tier] = [e])

  return tierMap
}

export default defineComponent({
  components: {
    VCardWrapper,
    BCard,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { measurements } = useCubeResponseProps(props)
    const tiers = computed(() => groupTiers(props.response.data, measurements.value[0]))

    return {
      tiers,
    }
  },
})
</script>
