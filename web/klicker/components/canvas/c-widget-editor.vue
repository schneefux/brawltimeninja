<template>
  <b-card
    title="Edit Widget"
    :elevation="elevation"
  >
    <div
      slot="content"
      class="my-1 flex flex-col gap-y-2"
    >
      <div class="ml-2 w-full flex gap-5">
        <h1 class="inline font-semibold mr-5">
          Widget Kind
        </h1>
        <label class="flex items-center">
          <b-radio
            :model-value="withQuery"
            value="false"
            name="withQuery"
            required
            primary
            @input="v => withQuery = v"
          ></b-radio>
          <span class="ml-2">Static Widget</span>
        </label>
        <label class="flex items-center">
          <b-radio
            :model-value="withQuery"
            value="true"
            name="withQuery"
            required
            primary
            @input="v => withQuery = v"
          ></b-radio>
          <span class="ml-2">Widget with Data</span>
        </label>
      </div>

      <c-dashboard
        v-if="query != undefined"
        v-model="query"
        :elevation="elevation + 1"
        configurator
      >
        <template v-slot:slices="data">
          <slot
            name="slices"
            v-bind="data"
          ></slot>
        </template>
        <template v-slot:totals="data">
          <b-card
            :elevation="elevation + 1"
            title="Data Source Info"
            class="w-full md:w-auto"
            full-height
          >
            <div
              slot="content"
              class="flex flex-wrap"
            >
              <slot
                name="totals"
                v-bind="data"
                :card="{ ...data.card, elevation: data.card && (data.card.elevation + 2) }"
              ></slot>
            </div>
          </b-card>
        </template>
        <template v-slot:data="data">
          <div class="contents">
            <c-visualisation-selector
              v-bind="data"
              :value="value"
              :spec="spec"
              :elevation="elevation + 1"
              class="w-full md:w-auto"
              for-canvas
              @input="v => $emit('input', v)"
              @delete="$emit('delete')"
            ></c-visualisation-selector>
            <slot></slot>
          </div>
        </template>
      </c-dashboard>

      <div
        v-else
        class="flex flex-wrap"
      >
        <c-visualisation-selector
          :value="value"
          :elevation="elevation + 1"
          :spec="spec"
          class="w-full md:w-auto"
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
import { defineComponent, PropType, computed, useContext } from '@nuxtjs/composition-api'
import { CubeComparingQuery, CubeQuery, VisualisationSpec, Widget } from '~/klicker'
import CVisualisationSelector from '~/klicker/components/canvas/c-visualisation-selector.vue'
import CDashboard from '~/klicker/components/c-dashboard.vue'
import CWidgetPropEditor from './c-widget-prop-editor.vue'
import BCard from '~/klicker/components/ui/b-card.vue'

/**
 * Form to edit a widget.
 */
export default defineComponent({
  components: {
    BCard,
    CDashboard,
    CVisualisationSelector,
    CWidgetPropEditor,
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
    const { $klicker } = useContext()
    const spec = computed<VisualisationSpec>(() => $klicker.visualisations.find(v => v.component == props.value.component)!)

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

    return {
      spec,
      query,
      withQuery,
    }
  },
})
</script>
