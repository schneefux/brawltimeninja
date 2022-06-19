<template>
  <b-card
    title="Edit Widget"
    :elevation="elevation"
  >
    <div
      slot="content"
      class="mt-4 flex flex-col gap-y-8"
    >
      <div class="w-full flex gap-4 items-center">
        <h1 class="inline mr-4">
          Widget Kind
        </h1>

        <b-radio
          :model-value="withQuery"
          :id="`${prefix}-static`"
          value="false"
          name="withQuery"
          required
          primary
          @input="v => withQuery = v"
        ></b-radio>
        <label
          :for="`${prefix}-static`"
        >
          Static Widget
        </label>

        <b-radio
          :model-value="withQuery"
          :id="`${prefix}-data`"
          value="true"
          name="withQuery"
          required
          primary
          @input="v => withQuery = v"
        ></b-radio>
        <label
          :for="`${prefix}-data`"
        >
          Widget with Data
        </label>
      </div>

      <c-dashboard
        v-if="query != undefined"
        v-model="query"
        :elevation="elevation + 1"
        :configurator="{
          configureCube: true,
          configureMetrics: true,
          configureMultipleMetrics: true,
          configureDimensions: true,
          configureCompareMode: true,
        }"
        slicer
      >
        <template v-slot:totals="data">
          <slot
            name="totals"
            v-bind="data"
            :card="{ ...data.card, elevation: data.card && (data.card.elevation + 1) }"
          ></slot>
        </template>
        <template v-slot:data="data">
          <c-visualisation-selector
            v-bind="data"
            :value="value"
            :elevation="elevation + 1"
            for-canvas
            @input="v => $emit('input', v)"
            @delete="$emit('delete')"
          ></c-visualisation-selector>
          <slot></slot>
        </template>
      </c-dashboard>

      <div
        v-else
        class="flex flex-wrap gap-8"
      >
        <c-visualisation-selector
          :value="value"
          :elevation="elevation + 1"
          for-canvas
          @input="v => $emit('input', v)"
          @delete="$emit('delete')"
        ></c-visualisation-selector>

        <slot></slot>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from '@vue/composition-api'
import { CubeComparingQuery, CubeQuery, Widget } from '../../types'
import CVisualisationSelector from './c-visualisation-selector.vue'
import CDashboard from '../c-dashboard.vue'
import BCard from '../ui/b-card.vue'
import { useUniqueId } from '../../composables/id'

/**
 * Form to edit a widget.
 */
export default defineComponent({
  components: {
    BCard,
    CDashboard,
    CVisualisationSelector,
  },
  props: {
    value: {
      type: Object as PropType<Widget>,
      required: true
    },
    elevation: {
      type: Number,
      default: 1
    },
    defaultQuery: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
  },
  setup(props, { emit }) {
    const withQuery = computed({
      get() {
        return props.value.query == undefined ? 'false' : 'true'
      },
      set(withQuery: string) {
        if (withQuery == 'true') {
          emit('input', {
            ...props.value,
            query: props.defaultQuery,
            component: 'v-table',
            props: {},
          })
        } else {
          emit('input', {
            ...props.value,
            query: undefined,
            component: 'v-markdown',
            props: {
              markdown: 'Hello World!',
            },
          })
        }
      }
    })

    const query = computed({
      get() {
        return props.value.query
      },
      set(query: CubeQuery|CubeComparingQuery|undefined) {
        emit('input', {
          ...props.value,
          query,
        })
      }
    })

    const { id: prefix } = useUniqueId()

    return {
      prefix,
      query,
      withQuery,
    }
  },
})
</script>
