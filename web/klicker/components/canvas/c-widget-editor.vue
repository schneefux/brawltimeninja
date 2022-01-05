<template>
  <b-card
    title="Edit Widget"
    :elevation="elevation"
  >
    <div
      slot="content"
      class="flex flex-wrap"
    >
      <div class="w-full ml-2 flex gap-5 mt-2">
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
        class="mt-4 w-full"
        configurator
      >
        <template v-slot:slices="data">
          <slot
            name="slices"
            v-bind="data"
          ></slot>
        </template>
        <template v-slot:totals="data">
          <slot
            name="totals"
            v-bind="data"
          ></slot>
        </template>
        <template v-slot:data="data">
          <c-visualisation-selector
            v-bind="data"
            :value="value"
            :spec="spec"
            :elevation="elevation + 1"
            class="w-full"
            @input="v => $emit('input', v)"
          ></c-visualisation-selector>
        </template>
      </c-dashboard>

      <c-visualisation-selector
        v-else
        :value="value"
        :elevation="elevation + 1"
        :spec="spec"
        class="w-full"
        @input="v => $emit('input', v)"
      ></c-visualisation-selector>
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
