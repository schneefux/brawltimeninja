<template>
  <b-card>
    <template v-slot:content>
      <div class="relative">
        <b-lightbox v-model="tooltipOpen">
          <b-card
            :elevation="0"
            class="w-full max-w-md h-auto"
          >
            <template v-slot:content>
              <slot name="tooltip">
                <p class="my-2">
                  {{ tooltip }}
                </p>
              </slot>
            </template>
          </b-card>
        </b-lightbox>
        <router-link
          v-if="tooltipLink != undefined"
          :to="tooltipLink"
          label="Tooltip"
          class="w-4 text-sm leading-none absolute top-1 right-0"
        >
          <fa :icon="faQuestion"></fa>
        </router-link>
        <button
          v-else-if="tooltip != undefined || 'tooltip' in $slots"
          label="Tooltip"
          class="w-4 text-sm leading-none absolute top-1 right-0"
          @click="tooltipOpen = !tooltipOpen"
        >
          <fa :icon="faQuestion"></fa>
        </button>
        <dl>
          <dt class="text-text/75">
            {{ title }}
          </dt>
          <dd class="text-xl text-text">
            <slot name="content">
              {{ value }}
            </slot>
          </dd>
        </dl>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import Fa from '../fa.vue'
import { defineComponent, ref } from 'vue'
import BCard from './b-card.vue'
import BLightbox from './b-lightbox.vue'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'

/**
 * Card which prominently displays a single number
 */
export default defineComponent({
  components: {
    BCard,
    BLightbox,
    Fa,
  },
  props: {
    title: {
      type: String,
      required: true
    },
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
      faQuestion,
      tooltipOpen,
    }
  },
})
</script>
