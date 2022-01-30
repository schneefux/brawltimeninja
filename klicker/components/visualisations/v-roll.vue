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
        <table class="mx-auto my-1 text-sm md:text-base text-center !leading-tight">
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
import { computed, defineComponent } from 'vue-demi'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import BCard from '../ui/b-card.vue'
import BHorizontalScroller from '../ui/b-horizontal-scroller.vue'

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
    const { $klicker, metrics, switchResponse } = useCubeResponseProps(props)

    const cards = computed(() =>
      switchResponse(response => response.data.map(e => ({
        id: e.id,
        title: props.long ? e.dimensions[response.query.dimensionsIds[0]] : undefined,
        entry: e,
        rows: metrics.value.map(m => ({
          id: m.id,
          text: e.metrics[m.id],
          name: $klicker.getName(m, 'short'),
        })),
      })), response => response.data.map(e => ({
        id: e.id,
        title: props.long ? e.dimensions[response.query.dimensionsIds[0]] : undefined,
        entry: e,
        rows: metrics.value.map(m => ({
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