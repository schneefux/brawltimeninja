<template>
  <b-card v-bind="{ ...card, title }">
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

      {{ $t('filter.configure' )}}
    </b-button>

    <div
      v-if="breakpointMd || showFilters"
      slot="content"
      class="mb-1 flex flex-col md:flex-row flex-wrap gap-x-2 gap-y-2"
    >
      <component
        v-for="spec in specs"
        :key="spec.name"
        :is="spec.import"
        :value="slices"
        :on-input="onInput"
      >
        <template
          v-for="(_, slot) of $scopedSlots"
          v-slot:[slot]="slotProps"
        >
          <slot
            v-bind="slotProps"
            :name="slot"
          ></slot>
        </template>
      </component>
    </div>
  </b-card>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref } from 'vue-demi'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { SliceValue, CubeQuery, CubeComparingQuery, SlicerSpec } from '../types'
import BButton from './ui/b-button.vue'
import { useCubeConfig } from '../composables/config'
import { useKlicker } from '../composables/klicker'

export default defineComponent({
  components: {
    FontAwesomeIcon,
    BButton,
  },
  props: {
    value: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
    },
    components: {
      type: Array as PropType<string[]>,
      required: false
    },
    excludeComponents: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    card: {
      type: undefined,
      required: false
    },
    comparing: {
      // true if the slicer controls test slices
      type: Boolean,
      default: false
    },
    both: {
      // true if the slicer controls test slices
      // and reference slices simultaneously
      type: Boolean,
      default: false
    },
  },
  setup(props, { emit }) {
    const { $klicker } = useKlicker()
    const showFilters = ref(false)

    const compareMode = computed(() => props.value.comparing)

    const slices = computed(() => {
      if (!compareMode.value) {
        return props.value.slices
      }

      if (props.comparing || props.both) {
        return props.value.slices
      } else {
        return (<CubeComparingQuery>props.value).reference.slices
      }
    })

    // slots cannot have event handlers,
    // so the handler is passed down instead
    const onInput = (s: Partial<SliceValue>) => {
      if (!compareMode.value) {
        emit('input', <CubeQuery>{
          ...props.value,
          slices: {
            ...props.value.slices,
            ...s,
          },
        })
      } else {
        const query = <CubeComparingQuery> props.value

        if (props.both) {
          emit('input', <CubeComparingQuery>{
            ...query,
            slices: {
              ...query.slices,
              ...s,
            },
            reference: {
              ...query.reference,
              slices: {
                ...query.reference.slices,
                ...s,
              },
            },
          })
        } else {
          if (props.comparing) {
            emit('input', <CubeComparingQuery>{
              ...query,
              slices: {
                ...query.slices,
                ...s,
              },
            })
          } else {
            emit('input', <CubeComparingQuery>{
              ...query,
              reference: {
                ...query.reference,
                slices: {
                  ...query.reference.slices,
                  ...s,
                },
              },
            })
          }
        }
      }
    }

    const title = computed(() => compareMode.value ? (props.comparing ? $klicker.$t('comparison.filter.test') : $klicker.$t('comparison.filter.reference')) : $klicker.$t('filter.title'))
    const breakpoints = useBreakpoints(breakpointsTailwind)
    const breakpointMd = breakpoints.greater('md')

    const cubeId = computed(() => {
      if (compareMode.value) {
        return props.comparing || props.both ? (<CubeComparingQuery> props.value).cubeId : (<CubeComparingQuery> props.value).reference.cubeId
      } else {
        return (<CubeQuery> props.value).cubeId
      }
    })

    const { checkSlicerApplicable } = useCubeConfig(cubeId)
    const specs = computed(() => {
      let applicableSpecs: SlicerSpec[] = []

      if (props.components != undefined) {
        applicableSpecs = props.components.map((component) => {
          const spec = $klicker.slicers.find(v => v.component == component)
          if (spec == undefined) {
            console.warn('Could not find requested slicer spec ' + component)
          }
          return spec!
        }).filter((spec) => {
          if (spec == undefined) {
            return false
          }

          if (checkSlicerApplicable(spec)) {
            return true
          } else {
            console.warn('Requested slicer spec ' + spec.component + ' not applicable')
            return false
          }
        })
      } else {
        applicableSpecs = $klicker.slicers.filter(checkSlicerApplicable)

        if (applicableSpecs.length == 0) {
          console.warn('Could not find any applicable slicer specs')
        }
      }

      return applicableSpecs
        .filter((spec) => !props.excludeComponents.includes(spec.component))
        .map((spec) => ({
          name: spec.name,
          import: spec.import,
        }))
    })

    return {
      breakpointMd,
      title,
      onInput,
      showFilters,
      slices,
      faFilter,
      specs,
    }
  }
})
</script>
