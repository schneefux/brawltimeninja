<template>
  <b-card
    v-if="query.measurements.length > 1"
    v-bind="$attrs"
  >
    <div
      slot="content"
      class="flex flex-wrap justify-center"
    >
      <b-card
        v-for="(entry, index) in query.data.slice(page*pageSize, (page+1)*pageSize)"
        :key="entry.id"
        :title="query.dimensions.map(d => entry.dimensions[d.id]).join(', ')"
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
                v-for="m in query.measurements"
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
        v-if="(page+1)*pageSize < query.data.length"
        class="ml-1 w-32"
        primary
        @click="page++"
      >Next Page</b-button>
    </div>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, toRefs, watch } from '@nuxtjs/composition-api'
import { CubeResponse } from '~/klicker'

export default defineComponent({
  inheritAttrs: false,
  props: {
    query: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 6
    }
  },
  setup(props) {
    const { query } = toRefs(props)

    const page = ref(0)
    watch(() => query.value.data, () => page.value = 0)

    return {
      page,
    }
  },
})
</script>
