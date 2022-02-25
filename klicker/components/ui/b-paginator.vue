<template>
  <div class="flex justify-center">
    <button
      v-show="page != 0"
      class="w-8 text-center"
      aria-label="previous"
      @click="page--"
    >
      <font-awesome-icon
        :icon="faCaretLeft"
      ></font-awesome-icon>
    </button>

    <span
      class="whitespace-nowrap"
      :class="{
        'ml-8': page == 0,
        'mr-8': page == pages - 1,
      }"
    >{{ page + 1 }} / {{ pages }}</span>

    <button
      v-show="page != pages - 1"
      class="w-8 text-center"
      aria-label="next"
      @click="page++"
    >
      <font-awesome-icon
        :icon="faCaretRight"
      ></font-awesome-icon>
    </button>
  </div>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent } from 'vue-demi'

export default defineComponent({
  components: {
    FontAwesomeIcon,
  },
  props: {
    value: {
      type: Number,
      required: true
    },
    pages: {
      type: Number,
      required: true
    },
  },
  setup(props, { emit }) {
    const page = computed({
      get(): number {
        return props.value
      },
      set(p: number) {
        emit('input', p)
      }
    })

    return {
      page,
      faCaretLeft,
      faCaretRight,
    }
  },
})
</script>
