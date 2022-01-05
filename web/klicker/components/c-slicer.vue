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
      class="my-1 flex flex-col md:flex-row flex-wrap gap-x-2 gap-y-2"
    >
      <slot :value="slices" :on-input="onInput"></slot>
    </div>
  </b-card>
</template>

<script lang="ts">
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api'
import { SliceValue, CubeQuery, CubeComparingQuery } from '~/klicker'
import BButton from '~/klicker/components/ui/b-button.vue'
import { useBreakpointTailwindCSS } from 'vue-composable'

export default defineComponent({
  components: {
    BButton,
  },
  props: {
    value: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
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
    const { i18n } = useContext()
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

    const title = computed(() => compareMode.value ? (props.comparing ? i18n.t('comparison.filter.test') : i18n.t('comparison.filter.reference')) : i18n.t('filter.title'))
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
