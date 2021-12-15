<template>
  <b-card v-bind="$attrs" :title="title">
    <b-button
      slot="preview"
      :selected="showFilters"
      class="md:hidden"
      primary
      sm
      @click="showFilters = !showFilters"
    >
      <font-awesome-icon
        :icon="faFilter"
      ></font-awesome-icon>

      Configure
    </b-button>

    <div
      v-if="breakpointMd || showFilters"
      slot="content"
      class="my-1 flex flex-col md:flex-row flex-wrap gap-x-2 gap-y-2"
    >
      <slot :value="slices" :on-input="onInput"></slot>
    </div>
  </b-card>
</template>

<script lang="ts">
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref } from '@nuxtjs/composition-api'
import { SliceValue, CubeQuery, CubeComparingQuery } from '~/klicker'
import BButton from '~/klicker/components/ui/b-button.vue'
import { useBreakpointTailwindCSS } from 'vue-composable'

export default defineComponent({
  components: {
    BButton,
  },
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
    },
    comparing: {
      // true if the slicer controls comparingSlices
      type: Boolean,
      default: false
    },
  },
  setup(props, { emit }) {
    const showFilters = ref(false)

    const compareMode = computed(() => 'comparing' in props.value)

    const slices = computed(() => {
      if (!compareMode.value) {
        return props.value.slices
      }

      if (props.comparing) {
        return props.value.slices
      } else {
        return (<CubeComparingQuery>props.value).reference.slices
      }
    })

    // slots cannot have event handlers,
    // so the handler is passed down instead
    const onInput = (s: Partial<SliceValue>) => {
      if (!compareMode.value || props.comparing) {
        emit('input', <CubeQuery>{
          ...props.value,
          slices: {
            ...slices.value,
            ...s,
          },
        })
      } else {
        emit('input', <CubeComparingQuery>{
          ...props.value,
          reference: {
            ...(<CubeComparingQuery>props.value).reference,
            slices: {
              ...slices.value,
              ...s,
            },
          },
        })
      }
    }

    const title = computed(() => compareMode.value ? (props.comparing ? 'Test Filters' : 'Reference Filters') : 'Filters')
    const { md: breakpointMd } = useBreakpointTailwindCSS()

    return {
      breakpointMd,
      title,
      onInput,
      showFilters,
      slices,
      faFilter,
    }
  }
})
</script>
