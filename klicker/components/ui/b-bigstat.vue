<template>
  <b-card>
    <div slot="content" class="relative">
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
        <font-awesome-icon
          :icon="faQuestion"
        ></font-awesome-icon>
      </router-link>
      <button
        v-else-if="tooltip != undefined || 'tooltip' in $slots"
        label="Tooltip"
        class="w-4 text-sm leading-none absolute top-1 right-0"
        @click="tooltipOpen = !tooltipOpen"
      >
        <font-awesome-icon
          :icon="faQuestion"
        ></font-awesome-icon>
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
  </b-card>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineComponent, ref } from 'vue'
import BCard from './b-card.vue'
import BLightbox from './b-lightbox.vue'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'

/**
 * Card which prominently displays a single number
 */
export default defineComponent({
  inheritAttrs: false,
  components: {
    BCard,
    BLightbox,
    FontAwesomeIcon,
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
