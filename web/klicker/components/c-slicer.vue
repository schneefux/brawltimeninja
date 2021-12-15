<template>
  <b-card v-bind="$attrs">
    <div slot="content" class="mb-1">
      <b-button
        :selected="showFilters"
        class="mr-3 my-2 md:hidden"
        primary
        sm
        @click="showFilters = !showFilters"
      >
        <font-awesome-icon
          :icon="faFilter"
        ></font-awesome-icon>

        Configure {{ compareMode ? (comparing ? 'Test Filters' : 'Reference Filters') : 'Filters' }}
      </b-button>

      <div
        :class="['md:block', {
          'hidden': !showFilters,
          'mt-3': showFilters,
        }]"
      >
        <h1 class="text-xl font-semibold hidden md:block my-1 mr-4">{{ compareMode ? (comparing ? 'Test Filters' : 'Reference Filters') : 'Filters' }}</h1>
        <div class="mb-3 flex flex-col md:flex-row flex-wrap gap-x-2 gap-y-2">
          <slot :value="slices" :on-input="onInput"></slot>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref } from '@nuxtjs/composition-api'
import { SliceValue, CubeQuery, CubeComparingQuery } from '~/klicker'
import BButton from '~/klicker/components/ui/b-button.vue'

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

    return {
      compareMode,
      onInput,
      showFilters,
      slices,
      faFilter,
    }
  }
})
</script>
