<template>
  <div class="contents">
    <label :for="`${prefix}-1`">
      {{ title }}
    </label>

    <div class="flex flex-wrap gap-4">
      <b-select
        v-for="index in numDimensions"
        :key="index"
        :model-value="modelValue.dimensionsIds[index - 1]"
        :id="`${prefix}-${index}`"
        :disabled="!editable"
        @update:modelValue="v => onInputDimensionsIds(index - 1, v)"
      >
        <option
          v-for="d in validDimensions(index)"
          :key="d.id"
          :value="d.id"
        >
          {{ d.name }}
        </option>
      </b-select>

      <div class="flex gap-x-1">
        <button
          v-if="numDimensions < maxDimensions"
          class="w-10 h-10"
          @click="onDimensionAdd()"
        >
          <fa :icon="faPlus"></fa>
        </button>

        <button
          v-if="numDimensions > 0"
          class="w-10 h-10"
          @click="onDimensionRemove()"
        >
          <fa :icon="faMinus"></fa>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CubeComparingQuery, CubeQuery } from '../types'
import Fa from './fa.vue'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref, useId, watch } from 'vue'
import { useKlickerConfig } from '../composables/klicker'
import BSelect from './ui/b-select.vue'
import BButton from './ui/b-button.vue'

export default defineComponent({
  components: {
    Fa,
    BSelect,
    BButton,
  },
  props: {
    modelValue: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
    },
    comparing: {
      // true if controls reference dimensions
      type: Boolean,
      default: false
    },
  },
  emits: {
    ['update:modelValue'](value: CubeQuery|CubeComparingQuery) { return true },
  },
  setup(props, { emit }) {
    const { $klicker, translate } = useKlickerConfig()

    const compareMode = computed(() => props.modelValue.comparing)

    const selectedDimensions = computed(() => {
      if (!compareMode.value) {
        return props.modelValue.dimensionsIds
      }

      if (props.comparing) {
        return props.modelValue.dimensionsIds
      } else {
        return (<CubeComparingQuery>props.modelValue).reference.dimensionsIds
      }
    })

    const numDimensions = ref(selectedDimensions.value.length)
    watch(compareMode, () => numDimensions.value = selectedDimensions.value.length)
    watch(selectedDimensions, () => numDimensions.value = selectedDimensions.value.length)

    function emitDimensionsIds(dimensionsIds: string[]) {
      if (!compareMode.value) {
        emit('update:modelValue', <CubeQuery>{
          ...props.modelValue,
          dimensionsIds,
        })
      } else {
        const query = <CubeComparingQuery> props.modelValue

        const newQuery = {
          ...query,
          dimensionsIds,
          reference: {
            ...query.reference,
            dimensionsIds: props.comparing ? dimensionsIds.slice(0, query.reference.dimensionsIds.length) : dimensionsIds,
          },
        }

        if (JSON.stringify(newQuery) != JSON.stringify(query)) {
          emit('update:modelValue', <CubeComparingQuery>newQuery)
        }
      }
    }

    const onInputDimensionsIds = (index: number, d: string) => {
      const dimensionsIds = selectedDimensions.value.slice()
      dimensionsIds[index] = d
      emitDimensionsIds(dimensionsIds)
    }

    const onDimensionAdd = () => {
      numDimensions.value++

      if (compareMode.value && !props.comparing) {
        const dimensionsIds = selectedDimensions.value.slice()
        dimensionsIds.push(props.modelValue.dimensionsIds[numDimensions.value-1])
        const query = <CubeComparingQuery> props.modelValue
        emit('update:modelValue', <CubeComparingQuery>{
          ...query,
          reference: {
            ...query.reference,
            dimensionsIds,
          },
        })
      }
    }

    const onDimensionRemove = () => {
      const dimensionsIds = selectedDimensions.value.slice()
      dimensionsIds.pop()
      emitDimensionsIds(dimensionsIds)
    }

    const dimensions = computed(() => $klicker.config[props.modelValue.cubeId].dimensions)
    const title = computed(() => compareMode.value ? (props.comparing ? translate('comparison.group.test') : translate('comparison.group.reference')) : translate('group.by'))

    const validDimensions = computed(() =>
      (index: number) => dimensions.value.filter(d => d.id == selectedDimensions.value[index - 1] || !selectedDimensions.value.includes(d.id)))

    const maxDimensions = computed(() => {
      if (editable.value) {
        return Math.min(dimensions.value.length, selectedDimensions.value.length + 1)
      } else {
        return props.modelValue.dimensionsIds.length
      }
    })
    const editable = computed(() => !compareMode.value || props.comparing)

    const prefix = useId()

    return {
      title,
      editable,
      numDimensions,
      maxDimensions,
      validDimensions,
      onInputDimensionsIds,
      onDimensionAdd,
      onDimensionRemove,
      faPlus,
      faMinus,
      prefix,
    }
  },
})
</script>
