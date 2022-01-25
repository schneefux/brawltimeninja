<template>
  <div class="contents">
    <span class="font-semibold">
      {{ title }}
    </span>

    <div class="flex flex-wrap gap-y-1 gap-x-1">
      <b-select
        v-for="index in numDimensions"
        :key="index"
        :value="value.dimensionsIds[index - 1]"
        :disabled="!editable"
        dark
        sm
        @input="v => onInputDimensionsIds(index - 1, v)"
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
        <b-button
          v-if="numDimensions < maxDimensions"
          class="font-semibold"
          primary
          sm
          @click="onDimensionAdd()"
        >
          <font-awesome-icon
            :icon="faPlus"
          ></font-awesome-icon>
        </b-button>

        <b-button
          v-if="numDimensions > 0"
          class="font-semibold"
          primary
          sm
          @click="onDimensionRemove()"
        >
          <font-awesome-icon
            :icon="faMinus"
          ></font-awesome-icon>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CubeComparingQuery, CubeQuery } from '../types'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref, watch } from 'vue-demi'
import { useKlicker } from '../composables/klicker'

export default defineComponent({
  components: {
    FontAwesomeIcon,
  },
  props: {
    value: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
    },
    comparing: {
      // true if controls reference dimensions
      type: Boolean,
      default: false
    },
  },
  setup(props, { emit }) {
    const { $klicker } = useKlicker()

    const compareMode = computed(() => props.value.comparing)

    const selectedDimensions = computed(() => {
      if (!compareMode.value) {
        return props.value.dimensionsIds
      }

      if (props.comparing) {
        return props.value.dimensionsIds
      } else {
        return (<CubeComparingQuery>props.value).reference.dimensionsIds
      }
    })

    const numDimensions = ref(selectedDimensions.value.length)
    watch(compareMode, () => numDimensions.value = selectedDimensions.value.length)
    watch(selectedDimensions, () => numDimensions.value = selectedDimensions.value.length)

    function emitDimensionsIds(dimensionsIds: string[]) {
      if (!compareMode.value) {
        emit('input', <CubeQuery>{
          ...props.value,
          dimensionsIds,
        })
      } else {
        const query = <CubeComparingQuery> props.value

        const newQuery = {
          ...query,
          dimensionsIds,
          reference: {
            ...query.reference,
            dimensionsIds: props.comparing ? dimensionsIds.slice(0, query.reference.dimensionsIds.length) : dimensionsIds,
          },
        }

        if (JSON.stringify(newQuery) != JSON.stringify(query)) {
          emit('input', <CubeComparingQuery>newQuery)
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
        dimensionsIds.push(props.value.dimensionsIds[numDimensions.value-1])
        const query = <CubeComparingQuery> props.value
        emit('input', <CubeComparingQuery>{
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

    const dimensions = computed(() => $klicker.config[props.value.cubeId].dimensions)
    const title = computed(() => compareMode.value ? (props.comparing ? $klicker.$t('comparison.group.test') : $klicker.$t('comparison.group.reference')) : $klicker.$t('group.by'))

    const validDimensions = computed(() =>
      (index: number) => dimensions.value.filter(d => d.id == selectedDimensions.value[index - 1] || !selectedDimensions.value.includes(d.id)))

    const maxDimensions = computed(() => {
      if (editable.value) {
        return Math.min(dimensions.value.length, selectedDimensions.value.length + 1)
      } else {
        return props.value.dimensionsIds.length
      }
    })
    const editable = computed(() => !compareMode.value || props.comparing)

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
    }
  },
})
</script>
