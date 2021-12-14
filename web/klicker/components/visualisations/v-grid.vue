<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
  >
    <div
      slot="content"
      class="flex flex-wrap justify-center"
    >
      <b-card
        v-for="(entry, index) in response.data.slice(page*pageSize, (page+1)*pageSize)"
        :key="entry.id"
        :title="dimensions.map(d => entry.dimensions[d.id]).join(', ')"
        elevation="2"
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
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, toRefs, useContext, watch } from '@nuxtjs/composition-api'
import { CubeResponse } from '~/klicker'

export default defineComponent({
  inheritAttrs: false,
  props: {
    response: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 6
    }
  },
  setup(props) {
    const { response } = toRefs(props)
    const { $klicker } = useContext()

    const dimensions = computed(() => $klicker.getDimensions(response.value.query))
    const measurements = computed(() => $klicker.getMeasurements(response.value.query))

    const show = computed(() => response.value.query.measurementsIds.length > 1)

    const page = ref(0)
    watch(() => response.value.data, () => page.value = 0)

    return {
      show,
      page,
      dimensions,
      measurements,
    }
  },
})
</script>
