<template>
  <b-card
    v-if="spec.props != undefined && Object.keys(spec.props).length > 0"
    title="Configure visualisation properties"
  >
    <div slot="content">
      <div
        v-for="(prop, type) in spec.props"
        :key="prop"
      >
        <label>
          {{ prop }}
          <textarea
            v-if="type == 'text'"
            :value="value[prop]"
            @input="e => $emit('input', { ...value, [prop]: e.target.value })"
          ></textarea>
        </label>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue-demi'
import { VisualisationSpec, Widget } from '../../types'

/**
 * Editor form for Widget.props
 */
export default defineComponent({
  props: {
    spec: {
      type: Object as PropType<VisualisationSpec>,
      required: true
    },
    value: {
      type: Object as PropType<Widget['props']>,
      required: true
    },
  },
})
</script>
