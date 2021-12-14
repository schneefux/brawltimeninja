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

        Configure {{ comparing ? 'Comparing ' : '' }} Filters
      </b-button>

      <div
        :class="['md:block', {
          'hidden': !showFilters,
          'mt-3': showFilters,
        }]"
      >
        <h1 class="text-xl font-semibold hidden md:block my-1 mr-4">{{ comparing ? 'Compare to' : 'Filters' }}</h1>
        <div class="mb-3 flex flex-col md:flex-row flex-wrap gap-x-2 gap-y-2">
          <slot :value="slices" :on-input="onInput"></slot>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, onMounted, PropType, ref, toRefs } from '@nuxtjs/composition-api'
import { SliceValue, CubeQuery } from '~/klicker'
import BButton from '~/klicker/components/ui/b-button.vue'

export default defineComponent({
  components: {
    BButton,
  },
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
    comparing: {
      // true if the slicer controls comparingSlices
      type: Boolean,
      default: false
    },
  },
  setup(props, { emit }) {
    const { value: query, comparing } = toRefs(props)

    const showFilters = ref(false)

    const slices = computed(() => comparing.value ? query.value.comparingSlices! : query.value.slices)

    // slots cannot have event handlers,
    // so the handler is passed down instead
    const onInput = (s: Partial<SliceValue>) => {
      emit('input', <CubeQuery>{
        ...query.value,
        [comparing.value ? 'comparingSlices' : 'slices']: {
          ...slices.value,
          ...s,
        },
      })
    }

    return {
      onInput,
      showFilters,
      slices,
      faFilter,
    }
  }
})
</script>
