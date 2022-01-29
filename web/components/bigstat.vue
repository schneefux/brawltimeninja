<template>
  <b-card
    v-bind="card"
    :title="label"
    full-height
    dense
  >
    <b-button
      v-if="tooltip != undefined"
      slot="preview"
      class="-my-1"
      dark
      xs
      @click="tooltipOpen = !tooltipOpen"
    >?</b-button>
    <div slot="content">
      <b-lightbox v-model="tooltipOpen">
        <b-card sm>
          <template v-slot:content>
            <slot name="tooltip">
              <p class="my-2">
                {{ tooltip }}
              </p>
            </slot>
          </template>
        </b-card>
      </b-lightbox>
      <p class="text-center text-3xl font-bold text-yellow-400 my-1">
        <slot name="value">
          {{ value }}
        </slot>
      </p>
    </div>
    <template
      v-if="'actions' in $scopedSlots"
      v-slot:actions
    >
      <slot name="actions"></slot>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  inheritAttrs: false,
  props: {
    value: {
      type: [Number, String],
      required: false
    },
    label: {
      type: String,
      required: false
    },
    tooltip: {
      type: String,
      required: false
    },
    card: {
      type: undefined,
      required: false
    },
  },
  setup() {
    const tooltipOpen = ref(false)

    return {
      tooltipOpen,
    }
  },
})
</script>
