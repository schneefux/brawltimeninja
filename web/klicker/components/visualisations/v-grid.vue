<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-grid"
  >
    <div
      slot="content"
      class="flex flex-wrap justify-center"
    >
      <b-card
        v-for="(entry, index) in response.data.slice(page*pageSize, (page+1)*pageSize)"
        :key="entry.id"
        :title="dimensions.map(d => entry.dimensions[d.id]).join(', ')"
        :elevation="(card != undefined ? card.elevation : 1) + 1"
        itemscope
        itemtype="http://schema.org/Person"
      >
        <span
          slot="preview"
          class="text-right font-semibold text-xl ml-auto"
        >#{{ index + page*pageSize + 1 }}</span>
        <div
          slot="content"
          class="flex flex-wrap"
        >
          <div class="mb-4 mr-2">
            <div class="my-1">
              <slot
                name="dimensions"
                :row="entry"
              ></slot>
            </div>
          </div>
          <table>
            <tbody>
              <tr
                v-for="m in measurements"
                :key="m.id"
                class="whitespace-nowrap"
                itemscope
                itemtype="http://schema.org/QuantitativeValue"
              >
                <td class="card-prop-value text-right pr-1" itemprop="unitText">
                  {{ entry.measurements[m.id] }}
                </td>
                <td class="card-prop-label" itemprop="value">
                  {{ $klicker.getName(m) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-card>
    </div>
    <div
      v-if="card != undefined"
      slot="actions"
      class="w-full flex justify-center"
    >
      <b-button
        v-if="page > 0"
        class="mr-1 w-32"
        primary
        @click="page--"
      >Previous Page</b-button>
      <b-button
        v-if="(page+1)*pageSize < response.data.length"
        class="ml-1 w-32"
        primary
        @click="page++"
      >Next Page</b-button>
    </div>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'
import { VisualisationProps } from '~/klicker/props'
import { useCubeResponse } from '~/klicker/composables/response'
import VCardWrapper from '~/klicker/components/visualisations/v-card-wrapper.vue'
import BCard from '~/klicker/components/ui/b-card.vue'

export default defineComponent({
  components: {
    BCard,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
    pageSize: {
      type: Number,
      default: 6
    }
  },
  setup(props) {
    const { dimensions, measurements } = useCubeResponse(props)

    const page = ref(0)
    watch(() => props.response.data, () => page.value = 0)

    return {
      page,
      dimensions,
      measurements,
    }
  },
})
</script>
