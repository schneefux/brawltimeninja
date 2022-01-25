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
                <td class="font-semibold text-right pr-1" itemprop="unitText">
                  {{ entry.measurements[m.id] }}
                </td>
                <td itemprop="value">
                  {{ getName(m) }}
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
import { defineComponent, ref, watch } from 'vue-demi'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import BCard from '../ui/b-card.vue'
import { Measurement } from '../../types'

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
    const { $klicker, dimensions, measurements } = useCubeResponseProps(props)

    const page = ref(0)
    watch(() => props.response.data, () => page.value = 0)

    const getName = (m: Measurement) => $klicker.getName(m)

    return {
      page,
      getName,
      dimensions,
      measurements,
    }
  },
})
</script>
