<template>
  <!-- increase z-index so that <b-fake-select> overlaps the following cards -->
  <b-card
    v-bind="card"
    :title="title"
    :class="{
      '-mb-2 md:mb-0': !showFilters,
    }"
    class="relative z-10"
    no-filter
    @clickHeader="toggleFilters"
  >
    <button
      slot="preview"
      :selected="showFilters"
      :aria-label="showFilters ? translate('action.collapse') : translate('action.expand')"
      :aria-controls="`${prefix}-filters`"
      class="md:hidden w-10"
      @click.stop="toggleFilters"
    >
      <font-awesome-icon
        :icon="showFilters ? faChevronUp : faChevronDown"
      ></font-awesome-icon>
    </button>

    <div
      :class="{
        'hidden md:flex': !showFilters,
        'flex': showFilters,
      }"
      :id="`${prefix}-filters`"
      :aria-expanded="showFilters"
      slot="content"
      class="flex-col md:flex-row flex-wrap gap-4"
    >
      <component
        v-for="spec in specs"
        :key="spec.name"
        :is="spec.import"
        :value="slices"
        :on-input="onInput"
      ></component>
    </div>
  </b-card>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref } from 'vue'
import { SliceValue, CubeQuery, CubeComparingQuery, SlicerSpec } from '../types'
import BCard from './ui/b-card.vue'
import { useCubeConfig } from '../composables/config'
import { useKlicker } from '../composables/klicker'
import { useUniqueId } from '../composables/id'

export default defineComponent({
  components: {
    FontAwesomeIcon,
    BCard,
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
    const { $klicker, translate } = useKlicker()
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

    const title = computed(() => {
      if (props.both || !compareMode.value) {
        return translate('filter.title')
      }

      if (props.comparing) {
        return translate('comparison.filter.test')
      } else {
        return translate('comparison.filter.reference')
      }
    })

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

    const toggleFilters = () => showFilters.value = !showFilters.value

    const { id: prefix } = useUniqueId()

    return {
      title,
      onInput,
      showFilters,
      slices,
      faChevronUp,
      faChevronDown,
      specs,
      translate,
      toggleFilters,
      prefix,
    }
  },
})
</script>
