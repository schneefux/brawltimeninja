<template>
  <b-horizontal-scroller
    class="relative"
    expand-on-desktop
  >
    <b-card
      v-for="(card, index) in cards"
      :key="card.id"
      :elevation="elevation"
      :title="card.title"
      :class="['shrink-0', {
        'ml-auto': index == 0,
        'mr-auto': index == cards.length - 1,
      }]"
      dense
    >
      <div
        slot="content"
        :class="{
          'flex items-center gap-2 my-1 mx-2': long,
        }"
      >
        <div class="mt-2 mx-auto shrink-0">
          <slot
            name="dimensions"
            :row="card.entry"
          ></slot>
        </div>
        <table class="mx-auto my-1 text-2xs md:text-xs lg:text-base text-center">
          <tbody>
            <tr
              v-for="r in card.rows"
              :key="r.id"
              class="whitespace-nowrap flex flex-col"
            >
              <td>
                {{ r.text }}
              </td>
              <td>
                {{ r.name }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </b-card>
  </b-horizontal-scroller>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { VisualisationProps } from '~/klicker'
import { useCubeResponse } from '~/klicker/composables/response'
import BCard from '~/klicker/components/ui/b-card.vue'
import BHorizontalScroller from '~/klicker/components/ui/b-horizontal-scroller.vue'

export default defineComponent({
  components: {
    BCard,
    BHorizontalScroller,
  },
  name: 'VRoll',
  props: {
    ...VisualisationProps,
    elevation: {
      type: Number,
      required: false
    },
    long: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const { $klicker, measurements, switchResponse } = useCubeResponse(props)

    const cards = computed(() =>
      switchResponse(response => response.data.map(e => ({
        id: e.id,
        title: props.long ? e.dimensions[response.query.dimensionsIds[0]] : undefined,
        entry: e,
        rows: measurements.value.map(m => ({
          id: m.id,
          text: e.measurements[m.id],
          name: $klicker.getName(m, 'short'),
        })),
      })), response => response.data.map(e => ({
        id: e.id,
        title: props.long ? e.dimensions[response.query.dimensionsIds[0]] : undefined,
        entry: e,
        rows: measurements.value.map(m => ({
          id: m.id,
          text: e.test.difference.difference,
          name: $klicker.getName(m, 'short'),
        })),
      }))))

    return {
      cards,
    }
  },
})
</script>
