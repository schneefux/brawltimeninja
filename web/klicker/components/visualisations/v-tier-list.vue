<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
  >
    <template v-slot:content>
      <ul>
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

      <div
        v-if="response.query.dimensionsIds[0] == 'brawler'"
        class="mt-2"
      >
        <v-tier-list-sharepic
          :tiers="tiers"
        ></v-tier-list-sharepic>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { CubeResponse, Measurement, MetaGridEntry } from '~/klicker'
import VTierListSharepic from '~/klicker/components/visualisations/v-tier-list-sharepic.vue'
import BCard from '~/klicker/components/ui/b-card.vue'
import { scaleEntriesIntoTiers } from '~/klicker/util'
import { computed, PropType } from '@vue/composition-api'
import { defineComponent, useContext } from '@nuxtjs/composition-api'

// TODO decouple v-tier-list-sharepic

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
  inheritAttrs: false,
  components: {
    BCard,
    VTierListSharepic,
  },
  props: {
    response: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { $klicker } = useContext()

    const show = computed(() => props.response.query.dimensionsIds.length == 1
      && props.response.query.measurementsIds.length == 1
      && props.response.data.length > 5
      && props.response.data.length < 100
    )

    const measurements = computed(() => $klicker.getMeasurements(props.response.query))

    const tiers = computed(() => groupTiers(props.response.data, measurements.value[0]))

    return {
      show,
      tiers,
    }
  },
})
</script>
