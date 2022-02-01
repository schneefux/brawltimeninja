<template>
  <b-card v-bind="{ fullHeight: true, dense: true, ...$attrs }">
    <b-button
      v-if="tooltip != undefined || tooltipLink != undefined"
      slot="preview"
      :to="tooltipLink"
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
      <div class="text-2xl text-primary-300 my-4 text-center">
        <slot name="content">
          {{ value }}
        </slot>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue-demi'
import BCard from './b-card.vue'
import BButton from './b-button.vue'
import BLightbox from './b-lightbox.vue'
import { StaticProps } from '../../props'

export default defineComponent({
  inheritAttrs: false,
  components: {
    BCard,
    BButton,
    BLightbox,
  },
  props: {
    value: {
      type: [Number, String],
      required: false
    },
    tooltip: {
      type: String,
      required: false
    },
    tooltipLink: {
      type: String,
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
