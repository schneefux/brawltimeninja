<template>
  <likert
    v-model="model"
    :start="start + 1"
    :questions="questions"
  >
    <template v-slot:low="{ id }">
      {{ $t('oejts.' + id + '.low') }}
    </template>
    <template v-slot:high="{ id }">
      {{ $t('oejts.' + id + '.high') }}
    </template>
  </likert>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { oejtsScores } from '~/lib/oejts'

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<Record<string, number>>,
      required: true
    },
    start: {
      type: Number,
      required: true
    },
    end: {
      type: Number,
      required: true
    },
  },
  setup(props, { emit }) {
    const questions = Object.keys(oejtsScores).slice(props.start, props.end)
    const model = computed({
      get() {
        return props.value
      },
      set(m: Record<string, number>) {
        emit('input', m)
      }
    })

    return {
      model,
      questions,
    }
  },
})
</script>
